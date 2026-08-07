/**
 * /api/moderate - one-click comment moderation from the notification email,
 * signed with an HMAC over `action:slug:id` (action is approve|reject).
 *
 * GET shows a confirmation page ONLY (no side effect) - important because email
 * clients and link/security scanners issue GET requests, which must never
 * approve or reject on their own. POST (from the confirm button) performs it:
 *  - approve: write the comment to main with approved:true (rebuilds/publishes)
 *    and remove it from the pending branch;
 *  - reject: delete the pending file. Nothing unapproved ever reaches main.
 * Env: COMMENT_SECRET, GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH?,
 * GITHUB_PENDING_BRANCH?.
 */
import { verifyApproval } from '../../lib/comments.js';
import { getFile, putFile, deleteFile } from './_github.js';

const ID_RE = /^[a-z0-9-]+$/;
const ACTIONS = new Set(['approve', 'reject']);

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function page(status, title, bodyHtml) {
  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<meta name="robots" content="noindex">` +
      `<title>${esc(title)}</title>` +
      `<body><main><h1>${esc(title)}</h1>${bodyHtml}</main></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

function params(source) {
  return {
    action: source.get('action') || '',
    slug: source.get('slug') || '',
    id: source.get('id') || '',
    sig: source.get('sig') || '',
  };
}

// Shared validation: env present, params well-formed, signature valid.
async function guard(env, p) {
  if (!env.COMMENT_SECRET || !env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return page(503, 'Not configured', '<p>Comment moderation is not set up on this site yet.</p>');
  }
  if (!ACTIONS.has(p.action) || !ID_RE.test(p.slug) || !ID_RE.test(p.id)) {
    return page(400, 'Bad request', '<p>That moderation link is malformed.</p>');
  }
  if (!(await verifyApproval(env.COMMENT_SECRET, `${p.action}:${p.slug}:${p.id}`, p.sig))) {
    return page(
      403,
      'Invalid link',
      '<p>That moderation link is invalid or has been tampered with.</p>'
    );
  }
  return null;
}

// GET: preview + confirmation button. No mutation.
export async function onRequestGet({ request, env }) {
  const p = params(new URL(request.url).searchParams);
  const bad = await guard(env, p);
  if (bad) return bad;

  const pending = env.GITHUB_PENDING_BRANCH || 'comments-pending';
  let file;
  try {
    file = await getFile(env, `src/_data/comments/${p.slug}/${p.id}.json`, pending);
  } catch {
    return page(
      502,
      'Something went wrong',
      '<p>Could not reach the store. Please try again shortly.</p>'
    );
  }
  if (!file) {
    return page(
      404,
      'Already handled',
      '<p>That comment is no longer in the queue (already approved or rejected).</p>'
    );
  }

  const verb = p.action === 'approve' ? 'Approve' : 'Reject';
  const c = file.content;
  return page(
    200,
    `${verb} this comment?`,
    `<blockquote><p><strong>${esc(c.name)}</strong> on <code>${esc(p.slug)}</code></p>` +
      `<p>${esc(c.body)}</p></blockquote>` +
      `<form method="post" action="/api/moderate">` +
      `<input type="hidden" name="action" value="${esc(p.action)}">` +
      `<input type="hidden" name="slug" value="${esc(p.slug)}">` +
      `<input type="hidden" name="id" value="${esc(p.id)}">` +
      `<input type="hidden" name="sig" value="${esc(p.sig)}">` +
      `<button type="submit">${verb} comment</button></form>`
  );
}

// POST: the only place that mutates.
export async function onRequestPost({ request, env }) {
  const p = params(await request.formData());
  const bad = await guard(env, p);
  if (bad) return bad;

  const main = env.GITHUB_BRANCH || 'main';
  const pending = env.GITHUB_PENDING_BRANCH || 'comments-pending';
  const path = `src/_data/comments/${p.slug}/${p.id}.json`;
  const post = `/blog/${p.slug}/#comments`;

  let file;
  try {
    file = await getFile(env, path, pending);
  } catch {
    return page(
      502,
      'Something went wrong',
      '<p>Could not reach the store. Please try again shortly.</p>'
    );
  }
  if (!file) {
    return page(404, 'Already handled', '<p>That comment is no longer in the queue.</p>');
  }

  try {
    if (p.action === 'reject') {
      await deleteFile(env, path, file.sha, `Reject comment ${p.id} on ${p.slug}`, pending);
      return page(
        200,
        'Comment rejected',
        `<p>Deleted from the queue. <a href="${post}">View the post</a>.</p>`
      );
    }
    file.content.approved = true;
    const onMain = await getFile(env, path, main);
    await putFile(
      env,
      path,
      file.content,
      `Approve comment ${p.id} on ${p.slug}`,
      onMain?.sha,
      main
    );
    await deleteFile(env, path, file.sha, `Remove approved comment ${p.id} from queue`, pending);
    return page(
      200,
      'Comment approved',
      `<p>It will appear once the site rebuilds (a minute or two). <a href="${post}">View the post</a>.</p>`
    );
  } catch {
    return page(
      502,
      'Something went wrong',
      '<p>Could not complete that action. Please try again shortly.</p>'
    );
  }
}
