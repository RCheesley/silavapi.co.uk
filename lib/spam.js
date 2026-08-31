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
// The alternation covers: generic verbs that need a real list keyword after them
// ("add me to your newsletter"), the "subscribe to your <list>" / "join your
// <list>" phrasings (the wave that says "I'd like to subscribe to your mailing
// list"), a bare intent to subscribe ("I'd like to subscribe", "want to sign
// up"), the standalone imperatives ("subscribe me", "sign me up"), and the
// "let me know when I'm subscribed" confirmation-chaser. The leading lookbehind
// exempts a negator immediately before the trigger, so a genuine opt-out ("do
// not subscribe me", "don't add my email…") is not flagged.
const LIST_SPAM_RE = new RegExp(
  `(?<!\\b${NEGATOR}\\s{1,4})\\b(?:` +
    `add me to (?:your |the )?${LIST_CONTEXT}|` +
    `put me on (?:your |the )?${LIST_CONTEXT}|` +
    `add my (?:e-?mail|address) to (?:your |the )?${LIST_CONTEXT}|` +
    `(?:subscribe|sign) me (?:up )?to (?:your |the )?${LIST_CONTEXT}|` +
    `subscribe (?:me )?to (?:your |the )?${LIST_CONTEXT}|` +
    `join your ${LIST_CONTEXT}|` +
    `(?:like|want|wish|love) to (?:subscribe|sign up|be added|be subscribed)|` +
    `subscribe me|sign me up|send me your newsletter|opt me in|` +
    `let me know (?:when|once) i(?:'|’)?(?:m| am) subscribed` +
    `)\\b`,
  'i'
);

/**
 * @param {string} [text]
 * @returns {boolean} true if `text` reads like a list-add / newsletter spam
 */
export function looksLikeListSpam(text) {
  return LIST_SPAM_RE.test(String(text || ''));
}

// A standalone "word" of 12+ characters made only of uppercase letters and
// digits and mixing the two (e.g. "METRYTRE2404060MAMYJRTH") - a junk/tracking
// token that genuine prose never contains. The two lookaheads require at least
// one letter and one digit, so an ordinary SHOUTED word or a long bare number
// is left alone.
const GIBBERISH_RE = /\b(?=[A-Z0-9]*[A-Z])(?=[A-Z0-9]*\d)[A-Z0-9]{12,}\b/;

/**
 * @param {string} [text]
 * @returns {boolean} true if `text` contains a long random letters+digits token
 */
export function looksLikeGibberish(text) {
  return GIBBERISH_RE.test(String(text || ''));
}

// A URL or a bare domain, restricted to common TLDs so that code-ish tokens
// ("index.html", "node.js", "README.md") don't register as domains.
const LINK_OR_DOMAIN_RE =
  /(?:https?:\/\/|www\.)\S+|\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.(?:com|net|org|info|biz|io|co|ru|ua|cn|xyz|online|site|shop|store|top|club|live|news|link|click|buzz|pro|vip|app)\b/i;
// Advertising phrasing that a genuine personal-site enquiry doesn't use.
const PROMO_RE =
  /\b(?:breaking news|stay updated|latest (?:news|headlines|updates|breaking)|global headlines|24\s?[x/]\s?7|for more (?:info|information|details)|click here|visit (?:us|our|my|the) (?:site|website|page|link)|check out (?:my|our|the) (?:site|website|deals|offers)|best price|lowest price|casino|crypto|forex|SEO services|rank(?:ing)? (?:higher|your (?:site|website)))\b/i;

/**
 * A link (or bare domain) *together with* advertising phrasing. A single plain
 * link on its own is left alone - only the promotional combination is spam.
 * @param {string} [text]
 * @returns {boolean}
 */
export function looksLikePromoLink(text) {
  const s = String(text || '');
  return LINK_OR_DOMAIN_RE.test(s) && PROMO_RE.test(s);
}

// Baltic/Slavic diacritics - ogonek (ą ę į ų), overdot (ė), carons (č š ž …)
// and ł - none of which appear in English or in the Pali/Sanskrit this site
// uses (ā ī ū ṇ ṣ ś ñ). Several together mark an off-topic foreign-language
// message (the Lithuanian/Polish "what's your price" spam).
const FOREIGN_DIACRITIC_RE = /[ąĄęĘįĮųŲėĖčČšŠžŽłŁćĆźŹżŻňŇřŘľĽďĎťŤ]/gu;
export const FOREIGN_DIACRITIC_MIN = 3;

/**
 * @param {string} [text]
 * @returns {boolean} true if `text` carries several Baltic/Slavic diacritics
 */
export function hasForeignDiacritics(text) {
  return (String(text || '').match(FOREIGN_DIACRITIC_RE) || []).length >= FOREIGN_DIACRITIC_MIN;
}
