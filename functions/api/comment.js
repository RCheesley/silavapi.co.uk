/**
 * POST /api/comment - receive a blog comment, store it as a pending file in the
 * repo (via the GitHub API), and email the moderator a one-click approve link.
 * Comments render at build time once approved. No cookies, no third-party JS.
 *
 * Env: GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH?, COMMENT_SECRET, SITE_URL,
 * plus RESEND_API_KEY / CONTACT_TO / CONTACT_FROM for the notification.
 */
import { validateComment, buildComment, signApproval } from '../../lib/comments.js';
import { isSpam } from '../../lib/contact.js';
import { putFile } from './_github.js';
import { deliverEmail } from './_email.js';

function isConfigured(env) {
  return Boolean(env.GITHUB_TOKEN && env.GITHUB_REPO && env.COMMENT_SECRET);
}

// Only same-site absolute paths may be used as the post return URL. Strip any
// CR/LF first (header-injection defence) and sanitise the fallback slug, since
// both feed into the redirect Location.
function safeReturn(returnField, slug) {
  const r = String(returnField || '').replace(/[\r\n]/g, '');
  if (/^\/(?!\/)/.test(r)) return r.split(/[?#]/)[0];
  const safeSlug = String(slug || '').replace(/[^a-z0-9-]/g, '');
  return `/blog/${safeSlug}/`;
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function redirect(location) {
  return new Response(null, { status: 303, headers: { Location: location } });
}

function notifyText(v, approveUrl) {
  return [
    `New comment on: ${v.slug}${v.parent ? ` (reply to ${v.parent})` : ''}`,
    `From: ${v.name}${v.email ? ` <${v.email}>` : ' (no email given)'}`,
    '',
    v.comment,
    '',
    '--- Approve it (one click):',
    approveUrl,
    '',
    'It stays hidden until you approve. Ignore this email to leave it unpublished.',
  ].join('\n');
}

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const fields = {};
  for (const [k, val] of form.entries()) fields[k] = typeof val === 'string' ? val : '';
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const back = safeReturn(fields.return, fields.slug);

  // Spam (honeypot / time-trap): silently accept, storing nothing.
  if (isSpam(fields))
    return wantsJson ? json(200, { ok: true }) : redirect(`${back}?posted=1#comments`);

  const { ok, errors, values } = validateComment(fields);
  if (!ok) {
    return wantsJson ? json(422, { ok: false, errors }) : redirect(`${back}?error=1#comment-form`);
  }

  if (!isConfigured(env)) {
    return wantsJson
      ? json(503, { ok: false, error: 'unconfigured' })
      : redirect(`${back}?error=1#comment-form`);
  }

  const id = crypto.randomUUID();
  const record = buildComment(values, { id, date: new Date().toISOString() });
  const path = `src/_data/comments/${values.slug}/${id}.json`;

  try {
    await putFile(env, path, record, `Comment on ${values.slug} (pending approval)`);
  } catch {
    return wantsJson ? json(502, { ok: false }) : redirect(`${back}?error=1#comment-form`);
  }

  // Notify + approve link. Best-effort: the comment is already saved, so a mail
  // hiccup shouldn't fail the request (it can still be approved via GitHub).
  try {
    const sig = await signApproval(env.COMMENT_SECRET, `${values.slug}:${id}`);
    const site = String(env.SITE_URL || '').replace(/\/$/, '');
    const approveUrl = `${site}/api/approve?slug=${encodeURIComponent(values.slug)}&id=${id}&sig=${sig}`;
    await deliverEmail(env, {
      subject: `New comment awaiting approval — ${values.slug}`,
      text: notifyText(values, approveUrl),
      replyTo: values.email || undefined,
    });
  } catch {
    /* noop: comment saved; moderation email is best-effort */
  }

  return wantsJson ? json(200, { ok: true, pending: true }) : redirect(`${back}?posted=1#comments`);
}
