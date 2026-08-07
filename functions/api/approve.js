/**
 * GET /api/approve?slug=&id=&sig= - one-click comment approval from the
 * moderation email. Verifies the HMAC signature, flips the stored comment's
 * `approved` flag to true and commits it, triggering a rebuild that publishes
 * the comment. Env: COMMENT_SECRET, GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH?.
 */
import { verifyApproval } from '../../lib/comments.js';
import { getFile, putFile } from './_github.js';

const ID_RE = /^[a-z0-9-]+$/;

function html(status, title, body) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>${title}</title>` +
      `<body style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem">` +
      `<h1>${title}</h1><p>${body}</p></body>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug') || '';
  const id = url.searchParams.get('id') || '';
  const sig = url.searchParams.get('sig') || '';

  if (!env.COMMENT_SECRET || !env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return html(503, 'Not configured', 'Comment moderation is not set up on this site yet.');
  }
  if (!ID_RE.test(slug) || !ID_RE.test(id)) {
    return html(400, 'Bad request', 'That approval link is malformed.');
  }
  if (!(await verifyApproval(env.COMMENT_SECRET, `${slug}:${id}`, sig))) {
    return html(403, 'Invalid link', 'That approval link is invalid or has been tampered with.');
  }

  const path = `src/_data/comments/${slug}/${id}.json`;
  let file;
  try {
    file = await getFile(env, path);
  } catch {
    return html(
      502,
      'Something went wrong',
      'Could not reach the store. Please try again shortly.'
    );
  }
  if (!file) return html(404, 'Not found', 'That comment no longer exists.');

  const post = `/blog/${slug}/#comments`;
  if (file.content.approved) {
    return html(
      200,
      'Already approved',
      `That comment is already live. <a href="${post}">View the post</a>.`
    );
  }

  file.content.approved = true;
  try {
    await putFile(env, path, file.content, `Approve comment ${id} on ${slug}`, file.sha);
  } catch {
    return html(
      502,
      'Something went wrong',
      'Could not save the approval. Please try again shortly.'
    );
  }
  return html(
    200,
    'Comment approved',
    `Thanks — it will appear once the site rebuilds (a minute or two). <a href="${post}">View the post</a>.`
  );
}
