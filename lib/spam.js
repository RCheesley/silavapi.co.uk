/**
 * spam.js - shared text-level spam heuristics used by both the contact form and
 * the blog comments. Pure functions, no I/O, so they are trivially unit-testable
 * and run identically on the edge and in Node.
 */

// Script-aware so accented Latin (é, ł, ā, ī - including "Sīlavāpi") counts as
// Latin, not as "other"; undercounting Latin would inflate the Cyrillic ratio.
const CYRILLIC_RE = /\p{Script=Cyrillic}/gu;
const LATIN_RE = /\p{Script=Latin}/gu;

// A submission that is mostly Cyrillic is spam for an English-language personal
// site. Tuned to need at least half the letters to be Cyrillic (not a stray word
// or a transliterated name), so a genuine English message with the odd Russian
// word isn't caught.
export const CYRILLIC_MIN = 5; // ignore a stray character or two
export const CYRILLIC_RATIO = 0.5; // Cyrillic must be at least half the letters

/**
 * @param {string} [text]
 * @returns {boolean} true if `text` is predominantly Cyrillic
 */
export function isCyrillicHeavy(text) {
  // Strip URL tokens first: a link's Latin characters (domain + path) must not
  // dilute the ratio - the spam wave is Cyrillic text plus a link, and counting
  // the URL's letters could push it below the threshold (a false negative).
  const s = String(text || '').replace(/https?:\/\/\S+|www\.\S+/gi, ' ');
  const cyrillic = (s.match(CYRILLIC_RE) || []).length;
  if (cyrillic < CYRILLIC_MIN) return false;
  const latin = (s.match(LATIN_RE) || []).length;
  return cyrillic / (cyrillic + latin) >= CYRILLIC_RATIO;
}

// The "add me to your mailing/contact list / newsletter" spam: an imperative
// request to be added to a list, which a genuine enquiry to a personal site
// essentially never makes. Deliberately matches the imperative phrasing only, so
// a real question like "do you have a newsletter?" does not trip it.
// The generic verbs ("add me to", "put me on") only count when a list/newsletter
// keyword follows, so "put me on the spot" or "add me on LinkedIn" don't match.
const LIST_CONTEXT = '(?:mailing list|contact list|email list|newsletter|database|list)';
const LIST_SPAM_RE = new RegExp(
  `\\b(?:add me to (?:your |the )?${LIST_CONTEXT}|put me on (?:your |the )?${LIST_CONTEXT}|add my (?:e-?mail|address)|subscribe me|sign me up|send me your newsletter|opt me in)\\b`,
  'i'
);

/**
 * @param {string} [text]
 * @returns {boolean} true if `text` reads like a list-add / newsletter spam
 */
export function looksLikeListSpam(text) {
  return LIST_SPAM_RE.test(String(text || ''));
}
