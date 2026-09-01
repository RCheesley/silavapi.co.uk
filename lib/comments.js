/**
 * comments.js - pure logic for the file-based blog comments, shared by the
 * Cloudflare Pages Functions (submit + approve) and the Eleventy build. Each
 * comment is stored as its own JSON file under src/_data/comments/<slug>/, so
 * the build reads them as data and this module threads/validates them. No I/O.
 */
import {
  isCyrillicHeavy,
  looksLikeListSpam,
  looksLikeGibberish,
  looksLikePromoLink,
  hasForeignDiacritics,
} from './spam.js';

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

/** A comment with more than this many links in its body is treated as spam. */
export const MAX_LINKS = 2;

/** Reject a comment POST whose raw body is larger than this many bytes. */
export const MAX_BODY_BYTES = 64 * 1024;

/** How long a moderation link stays valid after it is issued (30 days). */
export const APPROVAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const URL_IN_TEXT = /(?:https?:\/\/|www\.)/i;
const URL_IN_TEXT_G = /(?:https?:\/\/|www\.)/gi;

/**
 * Content-level spam heuristics for comments, layered on top of the honeypot +
 * time-trap in `isSpam`. Comment spam is overwhelmingly link injection or
 * off-topic non-English text, so a URL in the name, more than `MAX_LINKS` links
 * in the body, or a predominantly-Cyrillic name/body is treated as spam. The
 * caller drops these silently (nothing stored, no signal to the bot).
 */
export function looksSpammy(fields = {}) {
  const name = String(fields.name || '');
  const body = String(fields.comment || '');
  if (URL_IN_TEXT.test(name)) return true;
  if ((body.match(URL_IN_TEXT_G) || []).length > MAX_LINKS) return true;
  // A predominantly-Cyrillic comment on an English-language site is spam (the
  // recent wave is Russian text plus a link). Checked on the body and the name.
  if (isCyrillicHeavy(body) || isCyrillicHeavy(name)) return true;
  // The same content waves that hit the contact form also arrive as comments:
  // a "subscribe me to your newsletter" request, a random junk token, a
  // promotional link, or a foreign-language (Baltic / Slavic) message.
  return (
    looksLikeListSpam(body) ||
    looksLikeGibberish(`${name} ${body}`) ||
    looksLikePromoLink(body) ||
    hasForeignDiacritics(body)
  );
}

/** True if a `Content-Length` (in bytes) exceeds the allowed maximum. */
export function exceedsMaxBody(contentLength, max = MAX_BODY_BYTES) {
  const n = Number(contentLength);
  return Number.isFinite(n) && n > max;
}

/**
 * The signed payload for a moderation link. The issued-at timestamp `ts` is part
 * of what's signed, so it can't be altered to extend a link's life without
 * invalidating the signature.
 */
export function approvalPayload(action, slug, id, ts) {
  return `${action}:${slug}:${id}:${ts}`;
}

/**
 * True if a moderation link is too old to honour, or its timestamp is missing or
 * malformed. Lets a link sitting in a compromised inbox go stale on its own.
 */
export function isApprovalExpired(ts, now = Date.now(), ttl = APPROVAL_TTL_MS) {
  const t = Number(ts);
  if (!Number.isFinite(t) || t <= 0) return true;
  return now - t > ttl;
}
