/**
 * comments.js - pure logic for the file-based blog comments, shared by the
 * Cloudflare Pages Functions (submit + approve) and the Eleventy build. Each
 * comment is stored as its own JSON file under src/_data/comments/<slug>/, so
 * the build reads them as data and this module threads/validates them. No I/O.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export const COMMENT_LIMITS = { name: 100, email: 320, body: 5000 };

/**
 * Validate a submitted comment. Name + comment are required; email is optional
 * (used only to notify the moderator, never stored or shown). `slug` identifies
 * the post; `parent` is the id of the comment being replied to, if any.
 * @returns {{ok:boolean, errors:Record<string,string>, values:object}}
 */
export function validateComment(fields = {}) {
  const v = {};
  for (const k of ['name', 'email', 'comment', 'slug', 'parent'])
    v[k] = String(fields[k] || '').trim();
  const errors = {};

  if (!v.name) errors.name = 'Please add your name.';
  else if (v.name.length > COMMENT_LIMITS.name) errors.name = 'That name is a little too long.';

  if (v.email && (v.email.length > COMMENT_LIMITS.email || !EMAIL_RE.test(v.email)))
    errors.email = 'That email address doesn’t look quite right.';

  if (!v.comment) errors.comment = 'The comment is the important bit!';
  else if (v.comment.length > COMMENT_LIMITS.body)
    errors.comment = 'That comment is a little too long.';

  if (!SLUG_RE.test(v.slug)) errors.slug = 'Missing or invalid post reference.';

  // parent is a server-generated comment id (UUID-ish). Anything else is a
  // forged/oversized value: drop it silently so the comment becomes a root
  // rather than rejecting a genuine commenter (and never store junk).
  if (v.parent && !/^[a-z0-9-]{1,64}$/.test(v.parent)) v.parent = '';

  return { ok: Object.keys(errors).length === 0, errors, values: v };
}

/**
 * Build the record stored on disk. The commenter's email is deliberately NOT
 * stored (the repo is public); it only rides along in the moderation email.
 * @param {object} v - validated values
 * @param {{id:string, date:string}} meta
 */
export function buildComment(v, { id, date }) {
  return {
    id,
    parent: v.parent || null,
    name: v.name,
    body: v.comment,
    date,
    approved: false,
  };
}

function approvedList(input) {
  const all = Array.isArray(input) ? input : Object.values(input || {});
  return all.filter((c) => c && c.approved);
}

/** Number of approved comments (for the section heading). */
export function countComments(input = {}) {
  return approvedList(input).length;
}

/**
 * Thread approved comments into a nested, chronologically-sorted tree. A comment
 * whose parent is missing/unapproved becomes a root, so nothing is orphaned.
 * @returns {Array} roots, each with a `replies` array (same shape, recursive)
 */
export function threadComments(input = {}) {
  const byId = new Map(approvedList(input).map((c) => [c.id, { ...c, replies: [] }]));
  const roots = [];
  for (const c of byId.values()) {
    const parent = c.parent ? byId.get(c.parent) : null;
    if (parent) parent.replies.push(c);
    else roots.push(c);
  }
  const sortByDate = (list) => {
    list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    list.forEach((c) => sortByDate(c.replies));
    return list;
  };
  return sortByDate(roots);
}

/** Hex HMAC-SHA256 of `payload` with `secret`, using Web Crypto (edge + Node). */
export async function signApproval(secret, payload) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(String(secret)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(String(payload)));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time-ish check that `sig` is a valid signature for `payload`. */
export async function verifyApproval(secret, payload, sig) {
  const expected = await signApproval(secret, payload);
  const a = String(sig || '');
  if (a.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= a.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
