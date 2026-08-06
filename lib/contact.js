/**
 * contact.js - pure validation + spam-heuristic logic for the contact form,
 * shared by the Cloudflare Pages Function (functions/api/contact.js) and unit
 * tests. No I/O here, so it is trivially testable and runs identically on the
 * edge and in Node.
 */

// Deliberately liberal email check: enough to catch typos, not to reject valid
// but unusual addresses. Real validity is only ever proven by a reply landing.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LIMITS = { name: 200, email: 320, message: 5000 };

// Minimum time a genuine human takes to fill the form. A submit faster than this
// (when the JS time-trap stamped a start time) is treated as a bot.
export const MIN_FILL_MS = 3000;

/**
 * Validate the human-facing fields.
 * @param {{name?:string,email?:string,message?:string}} fields
 * @returns {{ok:boolean, errors:Record<string,string>, values:object}}
 */
export function validateSubmission(fields = {}) {
  const name = String(fields.name || '').trim();
  const email = String(fields.email || '').trim();
  const message = String(fields.message || '').trim();
  const errors = {};

  if (!name) errors.name = 'Please tell me your name.';
  else if (name.length > LIMITS.name) errors.name = 'That name is too long.';

  if (!email) errors.email = 'Please add an email address so I can reply.';
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email))
    errors.email = 'That email address doesn’t look quite right.';

  if (!message) errors.message = 'The message is the important bit!';
  else if (message.length > LIMITS.message) errors.message = 'That message is a little too long.';

  return { ok: Object.keys(errors).length === 0, errors, values: { name, email, message } };
}

/**
 * Cheap spam heuristics (no CAPTCHA): a filled honeypot, or a submit faster than
 * a human could manage when the time-trap was stamped.
 * @param {{website?:string, _started?:string}} fields
 * @param {number} now - current time in ms (injectable for tests)
 * @returns {boolean} true if the submission looks like a bot
 */
export function isSpam(fields = {}, now = Date.now()) {
  // Honeypot: a real (hidden) field left empty by humans, often filled by bots.
  if (String(fields.website || '').trim() !== '') return true;

  // Time-trap: only judges when a numeric start time is present (JS stamps it).
  // Absent/blank (e.g. no-JS) is not penalised; malformed is ignored.
  const started = Number(fields._started);
  if (Number.isFinite(started) && started > 0 && now - started < MIN_FILL_MS) return true;

  return false;
}
