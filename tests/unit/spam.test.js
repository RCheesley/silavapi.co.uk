import { describe, it, expect } from 'vitest';
import {
  isCyrillicHeavy,
  looksLikeListSpam,
  looksLikeGibberish,
  looksLikePromoLink,
  hasForeignDiacritics,
} from '../../lib/spam.js';

describe('isCyrillicHeavy', () => {
  it('flags a predominantly Cyrillic message', () => {
    expect(isCyrillicHeavy('Отличная статья, посетите наш сайт для скидок')).toBe(true);
  });

  it('does not flag ordinary English', () => {
    expect(isCyrillicHeavy('Thanks, really enjoyed this post about open source.')).toBe(false);
  });

  it('does not flag an English message with the odd Russian word', () => {
    // "Спасибо" (7 Cyrillic) is a minority against the English letters.
    expect(isCyrillicHeavy('Спасибо, great post - loved the migration write-up!')).toBe(false);
  });

  it('ignores a stray character or two below the minimum', () => {
    expect(isCyrillicHeavy('nice ж')).toBe(false);
  });

  it('still flags Cyrillic text plus a long URL (URL letters do not dilute it)', () => {
    expect(
      isCyrillicHeavy('Отличная статья, посетите https://cheap-deals.example.com/buy-now-today')
    ).toBe(true);
  });

  it('measures Cyrillic against all letters, not just Latin', () => {
    // Mostly Greek with a little Cyrillic and no Latin: Cyrillic is not the
    // majority of all letters, so it is not "Cyrillic-heavy".
    expect(isCyrillicHeavy('Καλημέρα κόσμε φίλε мир друг')).toBe(false);
  });

  it('counts accented Latin as Latin (no false positive on diacritics)', () => {
    // Accented Latin outweighs the Cyrillic here; ASCII-only Latin counting
    // would have miscounted and wrongly flagged this.
    expect(isCyrillicHeavy('Café résumé naïve Привет мир друг')).toBe(false);
  });

  it('is safe on empty/undefined input', () => {
    expect(isCyrillicHeavy('')).toBe(false);
    expect(isCyrillicHeavy()).toBe(false);
  });
});

describe('looksLikeListSpam', () => {
  it('flags imperative list-add / newsletter requests', () => {
    expect(looksLikeListSpam('Please add me to your mailing list')).toBe(true);
    expect(looksLikeListSpam('add my email to your database')).toBe(true);
    expect(looksLikeListSpam('subscribe me to your updates')).toBe(true);
    expect(looksLikeListSpam('Sign me up!')).toBe(true);
    expect(looksLikeListSpam('put me on your contact list')).toBe(true);
    expect(looksLikeListSpam('send me your newsletter every week')).toBe(true);
  });

  it('does not flag a genuine question about a newsletter', () => {
    expect(looksLikeListSpam('Do you have a newsletter I could follow?')).toBe(false);
    expect(looksLikeListSpam('Loved the talk - is there a mailing list?')).toBe(false);
  });

  it('does not flag generic "put me on" / "add me" phrases without list context', () => {
    expect(looksLikeListSpam('Could you put me on the spot at the next event?')).toBe(false);
    expect(looksLikeListSpam('Feel free to add me on LinkedIn')).toBe(false);
    expect(looksLikeListSpam('Please add me to the guest list for the talk')).toBe(false);
  });

  it('flags the "subscribe / join" phrasings and the confirmation chaser', () => {
    expect(looksLikeListSpam("I'd like to subscribe to your newsletter")).toBe(true);
    expect(looksLikeListSpam('please subscribe me to your mailing list')).toBe(true);
    expect(looksLikeListSpam("I'd like to be added to your mailing list")).toBe(true);
    expect(looksLikeListSpam('happy to join your newsletter')).toBe(true);
    expect(looksLikeListSpam('let me know when I am subscribed')).toBe(true);
    expect(looksLikeListSpam("let me know once I'm subscribed")).toBe(true);
  });

  it('does not flag a directly-negated / opt-out phrasing', () => {
    expect(looksLikeListSpam('Please do not subscribe me to anything')).toBe(false);
    expect(looksLikeListSpam("don't add my email to your mailing list")).toBe(false);
    expect(looksLikeListSpam("please don't subscribe me to your newsletter")).toBe(false);
  });

  it('does not flag a genuine "subscribe to <non-list>" message', () => {
    // A list keyword is required after the verb, so a real non-list target
    // (RSS feed, blog, YouTube channel) and "unsubscribe" must not trip it.
    expect(looksLikeListSpam("I'd like to subscribe to your RSS feed")).toBe(false);
    expect(looksLikeListSpam('I already subscribe to your blog')).toBe(false);
    expect(looksLikeListSpam('How do I unsubscribe?')).toBe(false);
  });

  it('still flags spam when a negation appears elsewhere (not negating the verb)', () => {
    expect(looksLikeListSpam("Add me to your mailing list, don't wait!")).toBe(true);
  });

  it('is safe on empty/undefined input', () => {
    expect(looksLikeListSpam('')).toBe(false);
    expect(looksLikeListSpam()).toBe(false);
  });
});

describe('looksLikeGibberish', () => {
  it('flags a long random letters+digits token', () => {
    expect(looksLikeGibberish('METRYTRE2404060MAMYJRTH')).toBe(true);
    // Exactly 12 chars, mixing letters and digits, embedded in a sentence.
    expect(looksLikeGibberish('order code AB12CD34EF56 confirmed')).toBe(true);
  });

  it('leaves ordinary shouted words and long numbers alone', () => {
    expect(looksLikeGibberish('THANK YOU SO MUCH FOR THIS')).toBe(false);
    expect(looksLikeGibberish('1234567890123456')).toBe(false); // digits only, no letter
    expect(looksLikeGibberish('COVID19 update')).toBe(false); // too short
  });

  it('is safe on empty/undefined input', () => {
    expect(looksLikeGibberish('')).toBe(false);
    expect(looksLikeGibberish()).toBe(false);
  });
});

describe('looksLikePromoLink', () => {
  it('flags a bare domain (or URL) together with advertising phrasing', () => {
    expect(
      looksLikePromoLink('Latest breaking news, stay updated 24/7 - ukbreakingnews24x7.com')
    ).toBe(true);
    expect(looksLikePromoLink('Best price! visit our website http://deals.example')).toBe(true);
  });

  it('allows a plain link with no promotional phrasing', () => {
    expect(looksLikePromoLink('My site is www.example.com if that helps')).toBe(false);
  });

  it('allows promotional-ish words with no link', () => {
    expect(looksLikePromoLink('I saw the latest news about your talk')).toBe(false);
  });

  it('is safe on empty/undefined input', () => {
    expect(looksLikePromoLink('')).toBe(false);
    expect(looksLikePromoLink()).toBe(false);
  });
});

describe('hasForeignDiacritics', () => {
  it('flags a message heavy in Baltic/Slavic diacritics', () => {
    expect(hasForeignDiacritics('Sveiki, aš norėjau sužinoti jūsų kainą.')).toBe(true);
  });

  it('does not flag Pali/Sanskrit, or English with a stray accent below the threshold', () => {
    expect(hasForeignDiacritics('I met Bodhipakṣiṇī and Mokṣagandhi with Sīlavāpi')).toBe(false);
    // "František Dvořák" carries two such diacritics (š, ř) - under the minimum.
    expect(hasForeignDiacritics('My name is František Dvořák and I loved this')).toBe(false);
  });

  it('is safe on empty/undefined input', () => {
    expect(hasForeignDiacritics('')).toBe(false);
    expect(hasForeignDiacritics()).toBe(false);
  });
});
