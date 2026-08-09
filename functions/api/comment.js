/**
 * POST /api/comment - receive a blog comment, store it as a pending file on the
 * holding branch (via the GitHub API), and email the moderator one-click
 * approve + reject links. Nothing reaches main (so nothing rebuilds/publishes)
 * until it is approved. No cookies, no third-party JS.
 *
 * Env: GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH?, GITHUB_PENDING_BRANCH?,
 * COMMENT_SECRET, SITE_URL, plus RESEND_API_KEY / CONTACT_TO / CONTACT_FROM.
 */
import {
  validateComment,
  buildComment,
  signApproval,
  approvalPayload,
  looksSpammy,
  exceedsMaxBody,
} from '../../lib/comments.js';
import { isSpam } from '../../lib/contact.js';
import { putFile, ensureBranch } from './_github.js';
import { deliverEmail } from './_email.js';

const PENDING = (env) => env.GITHUB_PENDING_BRANCH || 'comments-pending';

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

function notifyText(v, approveUrl, rejectUrl) {
  return [
    `New comment on: ${v.slug}${v.parent ? ` (reply to ${v.parent})` : ''}`,
    `From: ${v.name}${v.email ? ` <${v.email}>` : ' (no email given)'}`,
    '',
    v.comment,
    '',
    '--- Approve (publishes it):',
    approveUrl,
    '',
    '--- Reject (deletes it from the queue):',
    rejectUrl,
    '',
    'It stays hidden until you approve. Ignoring this email leaves it queued.',
  ].join('\n');
}

export async function onRequestPost({ request, env }) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');

  // Bound the work per request: reject an oversized body before parsing it.
  if (exceedsMaxBody(request.headers.get('content-length')))
    return wantsJson ? json(413, { ok: false, error: 'too_large' }) : redirect('/?error=1');

  // Parse the form. A non-form body (e.g. a bot POSTing JSON) is a clean 400,
  // not an uncaught 500.
  let form;
  try {
    form = await request.formData();
  } catch {
    return wantsJson ? json(400, { ok: false, error: 'bad_request' }) : redirect('/?error=1');
  }
  const fields = {};
  for (const [k, val] of form.entries()) fields[k] = typeof val === 'string' ? val : '';
  const back = safeReturn(fields.return, fields.slug);

  // Spam: honeypot / time-trap, plus content heuristics (links in the body or a
  // URL in the name). Silently accept, storing nothing, so bots get no signal.
  if (isSpam(fields) || looksSpammy(fields))
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
    // Store on the holding branch (created from main if it doesn't exist yet),
    // so nothing reaches main / the live build until approved.
    await ensureBranch(env, PENDING(env));
    await putFile(
      env,
      path,
      record,
      `Comment on ${values.slug} (pending)`,
      undefined,
      PENDING(env)
    );
  } catch {
    return wantsJson ? json(502, { ok: false }) : redirect(`${back}?error=1#comment-form`);
  }

  // Notify + approve/reject links. Best-effort: the comment is already saved, so
  // a mail hiccup shouldn't fail the request (it can still be handled on GitHub).
  try {
    const site = String(env.SITE_URL || '').replace(/\/$/, '');
    const link = async (action) => {
      const ts = Date.now();
      const sig = await signApproval(
        env.COMMENT_SECRET,
        approvalPayload(action, values.slug, id, ts)
      );
      return `${site}/api/moderate?action=${action}&slug=${encodeURIComponent(values.slug)}&id=${id}&ts=${ts}&sig=${sig}`;
    };
    await deliverEmail(env, {
      subject: `New comment awaiting approval — ${values.slug}`,
      text: notifyText(values, await link('approve'), await link('reject')),
      replyTo: values.email || undefined,
    });
  } catch {
    /* noop: comment saved; moderation email is best-effort */
  }

  return wantsJson ? json(200, { ok: true, pending: true }) : redirect(`${back}?posted=1#comments`);
}
