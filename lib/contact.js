/**
 * contact.js - pure validation + spam-heuristic logic for the contact form,
 * shared by the Cloudflare Pages Function (functions/api/contact.js) and unit
 * tests. No I/O here, so it is trivially testable and runs identically on the
 * edge and in Node.
 */
import {
  isCyrillicHeavy,
  looksLikeListSpam,
  looksLikeGibberish,
  looksLikePromoLink,
  hasForeignDiacritics,
} from './spam.js';

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
 * Validate a speaker-enquiry submission (the /speaking/book/ form). Requires the
 * fields needed to assess a booking; the rest are optional context. Same email
 * rule + length caps as the general form.
 * @returns {{ok:boolean, errors:Record<string,string>, values:object}}
 */
export function validateSpeakerEnquiry(fields = {}) {
  const v = {};
  for (const k of [
    'name',
    'email',
    'event',
    'date_start',
    'date_end',
    'topic',
    'location',
    'format',
    'audience',
    'budget',
    'message',
  ])
    v[k] = String(fields[k] || '').trim();
  const errors = {};

  if (!v.name) errors.name = 'Please tell me your name.';
  else if (v.name.length > LIMITS.name) errors.name = 'That name is too long.';

  if (!v.email) errors.email = 'Please add an email address so I can reply.';
  else if (v.email.length > LIMITS.email || !EMAIL_RE.test(v.email))
    errors.email = 'That email address doesn’t look quite right.';

  // Dates are optional (an enquiry can be exploratory), so name/event/topic are
  // the only required context beyond how to reach you.
  if (!v.event) errors.event = 'Please add the event or organisation.';
  if (!v.topic) errors.topic = 'What would you like me to speak about?';
  if (v.topic.length > LIMITS.message) errors.topic = 'That is a little too long.';
  if (v.message.length > LIMITS.message) errors.message = 'That is a little too long.';

  return { ok: Object.keys(errors).length === 0, errors, values: v };
}

/** Human-readable event date from the optional start/end date fields. */
export function formatEventDate(v = {}) {
  const s = String(v.date_start || '').trim();
  const e = String(v.date_end || '').trim();
  if (s && e && e !== s) return `${s} to ${e}`;
  return s || 'Not set / flexible';
}

/** Format a speaker enquiry as a readable plain-text email body. */
export function formatSpeakerMessage(v = {}) {
  const line = (label, value) => `${label}: ${value && String(value).trim() ? value : '—'}`;
  return [
    line('Event / organisation', v.event),
    line('Date', formatEventDate(v)),
    line('Location', v.location),
    line('Format', v.format),
    line('Audience size', v.audience),
    line('Budget / travel', v.budget),
    '',
    'Topic / what to speak about:',
    v.topic || '—',
    '',
    'Anything else:',
    v.message && String(v.message).trim() ? v.message : '—',
  ].join('\n');
}

/**
 * Count URL-like tokens in a string. Each URL is matched as one whole token so a
 * single link like `http://www.example.com` isn't double-counted (once for the
 * scheme and once for the embedded `www.`).
 */
function countLinks(value) {
  const m = String(value || '').match(/https?:\/\/\S+|www\.[a-z0-9-]+\.[a-z]\S*/gi);
  return m ? m.length : 0;
}

// Genuine-looking spam that clears the honeypot/time-trap almost always carries
// link tells. These are deliberately high-precision (a real message rarely trips
// them), because a match is dropped silently. A message with this many links (or
// more) is treated as spam.
export const SPAM_LINK_THRESHOLD = 5;

/**
 * Content heuristics for spam that passes the honeypot and time-trap: link tells,
 * predominantly-Cyrillic text, or an "add me to your list / newsletter" request.
 * Checks the free-text fields of both the contact and speaker forms.
 * @param {{name?:string, message?:string, topic?:string}} fields
 * @returns {boolean}
 */
export function looksLikeSpamContent(fields = {}) {
  // A URL in the name field is a near-certain bot tell - names aren't URLs.
  if (countLinks(fields.name) > 0) return true;

  const body = `${String(fields.message || '')}\n${String(fields.topic || '')}`;
  // BBCode or HTML link markup (raw or HTML-escaped) never appears in a genuine
  // plain-text message.
  if (/\[url[=\]]|\[link[=\]]|(?:<|&lt;)a\s+href=/i.test(body)) return true;
  // A pile of links in a short contact message is spam.
  if (countLinks(body) >= SPAM_LINK_THRESHOLD) return true;
  // Predominantly-Cyrillic text on an English-language site, or a "subscribe me
  // to your list / newsletter" request, is spam.
  if (isCyrillicHeavy(`${String(fields.name || '')} ${body}`)) return true;
  if (looksLikeListSpam(body)) return true;
  // A random junk token, a promotional link, or a foreign-language (Baltic /
  // Slavic) message - each a distinct wave that clears the honeypot/time-trap.
  if (looksLikeGibberish(`${String(fields.name || '')} ${body}`)) return true;
  if (looksLikePromoLink(body)) return true;
  if (hasForeignDiacritics(body)) return true;

  return false;
}

/**
 * Cheap spam heuristics (no CAPTCHA): a filled honeypot, a submit faster than a
 * human could manage when the time-trap was stamped, or link-heavy content.
 * @param {{website?:string, _started?:string, name?:string, message?:string, topic?:string}} fields
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

  // Content tells (links in the name, link markup, many links).
  if (looksLikeSpamContent(fields)) return true;

  return false;
}
