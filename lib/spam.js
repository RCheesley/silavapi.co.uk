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
// A list-add / newsletter request, in two shapes: generic verbs ("add me to",
// "put me on", "add my email to") that require a real mailing-type keyword after
// them (so "put me on the spot", "add me on LinkedIn", "add me to the guest list"
// don't match - bare "list" is excluded), and standalone imperatives ("subscribe
// me", "sign me up", "send me your newsletter", "opt me in"). A trigger that is
// directly negated ("do not subscribe me", "don't add my email...") is a genuine
// opt-out: the lookbehind exempts a negator immediately before the trigger, while
// a negation elsewhere in the message does not disable the match.
const LIST_CONTEXT =
  '(?:(?:mailing|contact|email|e-mail|distribution|subscriber|marketing) list|newsletter|database)';
const NEGATOR = "(?:not|never|do ?n['’]?t)";
const LIST_SPAM_RE = new RegExp(
  `(?<!\\b${NEGATOR}\\s{1,4})\\b(?:add me to (?:your |the )?${LIST_CONTEXT}|put me on (?:your |the )?${LIST_CONTEXT}|add my (?:e-?mail|address) to (?:your |the )?${LIST_CONTEXT}|subscribe me|sign me up|send me your newsletter|opt me in)\\b`,
  'i'
);

/**
 * @param {string} [text]
 * @returns {boolean} true if `text` reads like a list-add / newsletter spam
 */
export function looksLikeListSpam(text) {
  return LIST_SPAM_RE.test(String(text || ''));
}
