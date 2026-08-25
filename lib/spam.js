/**
 * spam.js - shared text-level spam heuristics used by both the contact form and
 * the blog comments. Pure functions, no I/O, so they are trivially unit-testable
 * and run identically on the edge and in Node.
 */

const CYRILLIC_RE = /[Ѐ-ӿ]/g;
const LATIN_RE = /[A-Za-z]/g;

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
  const s = String(text || '');
  const cyrillic = (s.match(CYRILLIC_RE) || []).length;
  if (cyrillic < CYRILLIC_MIN) return false;
  const latin = (s.match(LATIN_RE) || []).length;
  return cyrillic / (cyrillic + latin) >= CYRILLIC_RATIO;
}

// The "add me to your mailing/contact list / newsletter" spam: an imperative
// request to be added to a list, which a genuine enquiry to a personal site
// essentially never makes. Deliberately matches the imperative phrasing only, so
// a real question like "do you have a newsletter?" does not trip it.
const LIST_SPAM_RE =
  /\b(?:add me|add my (?:e-?mail|address)|subscribe me|sign me up|put me on (?:your|the)|send me your newsletter|opt me in)\b/i;

/**
 * @param {string} [text]
 * @returns {boolean} true if `text` reads like a list-add / newsletter spam
 */
export function looksLikeListSpam(text) {
  return LIST_SPAM_RE.test(String(text || ''));
}
