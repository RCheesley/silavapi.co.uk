import { describe, it, expect } from 'vitest';
import { isCyrillicHeavy, looksLikeListSpam } from '../../lib/spam.js';

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

  it('does not flag negated / opt-out phrasing', () => {
    expect(looksLikeListSpam('Please do not subscribe me to anything')).toBe(false);
    expect(looksLikeListSpam("don't add my email to your mailing list")).toBe(false);
  });

  it('is safe on empty/undefined input', () => {
    expect(looksLikeListSpam('')).toBe(false);
    expect(looksLikeListSpam()).toBe(false);
  });
});
