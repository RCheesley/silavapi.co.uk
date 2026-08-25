/**
 * spam.js - shared text-level spam heuristics used by both the contact form and
 * the blog comments. Pure functions, no I/O, so they are trivially unit-testable
 * and run identically on the edge and in Node.
 */

// Cyrillic vs every letter (any script), so the ratio genuinely measures
// "mostly Cyrillic": accented Latin (é, ā, ī - including "Sīlavāpi") counts as a
// letter, and so do Greek/Han/etc., rather than being ignored.
const CYRILLIC_RE = /\p{Script=Cyrillic}/gu;
const LETTER_RE = /\p{L}/gu;

// A submission that is mostly Cyrillic is spam for an English-language personal
// site. Tuned to need at least half of all letters to be Cyrillic (not a stray
// word or a transliterated name), so a genuine English message with the odd
// Russian word isn't caught.
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
  // Non-null: cyrillic >= MIN guarantees at least MIN letters, so no `|| []`.
  const letters = s.match(LETTER_RE).length;
  return cyrillic / letters >= CYRILLIC_RATIO;
}

// The "add me to your mailing/contact list / newsletter" spam: an imperative
// request to be added to a list, which a genuine enquiry to a personal site
// essentially never makes. Deliberately matches the imperative phrasing only, so
// a real question like "do you have a newsletter?" does not trip it.
// The generic verbs ("add me to", "put me on", "add my email to") only count
// when a real mailing-type keyword follows, so "put me on the spot", "add me on
// LinkedIn", or "add me to the guest list" don't match. Bare "list" is excluded
// (guest/waiting/attendee list); a qualifier is required.
const LIST_CONTEXT =
  '(?:(?:mailing|contact|email|e-mail|distribution|subscriber|marketing) list|newsletter|database)';
const LIST_SPAM_RE = new RegExp(
  `\\b(?:add me to (?:your |the )?${LIST_CONTEXT}|put me on (?:your |the )?${LIST_CONTEXT}|add my (?:e-?mail|address) to (?:your |the )?${LIST_CONTEXT}|subscribe me|sign me up|send me your newsletter|opt me in)\\b`,
  'i'
);

// A negated / opt-out phrasing ("please do not subscribe me", "don't add my
// email to your list") is a genuine request, not spam, so exempt it.
const NEGATION_RE = /\b(?:do not|do ?n['’]?t|never)\b/i;

/**
 * @param {string} [text]
 * @returns {boolean} true if `text` reads like a list-add / newsletter spam
 */
export function looksLikeListSpam(text) {
  const s = String(text || '');
  return LIST_SPAM_RE.test(s) && !NEGATION_RE.test(s);
}
