import { describe, it, expect } from 'vitest';
import { parseBlocks } from '../../scripts/fetch-fonts.mjs';

// A representative slice of what the Google Fonts css2 endpoint returns.
const SAMPLE = `
/* cyrillic */
@font-face {
  font-family: 'Lato';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/lato/cyr.woff2) format('woff2');
  unicode-range: U+0400-045F;
}
/* latin-ext */
@font-face {
  font-family: 'Lato';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/lato/latinext.woff2) format('woff2');
  unicode-range: U+0100-02BA;
}
/* latin */
@font-face {
  font-family: 'Lato';
  font-style: italic;
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/lato/latin.woff2) format('woff2');
  unicode-range: U+0000-00FF;
}
`;

describe('parseBlocks', () => {
  const blocks = parseBlocks(SAMPLE);

  it('parses one entry per @font-face block', () => {
    expect(blocks).toHaveLength(3);
  });

  it('captures subset, family, style, weight, unicode-range and url', () => {
    const latinExt = blocks.find((b) => b.subset === 'latin-ext');
    expect(latinExt).toMatchObject({
      subset: 'latin-ext',
      family: 'Lato',
      style: 'normal',
      weight: '400',
      unicodeRange: 'U+0100-02BA',
      url: 'https://fonts.gstatic.com/s/lato/latinext.woff2',
    });
  });

  it('preserves font-style italic and weight 700', () => {
    const italic = blocks.find((b) => b.style === 'italic');
    expect(italic.weight).toBe('700');
    expect(italic.subset).toBe('latin');
  });

  it('returns an empty array when there are no @font-face blocks', () => {
    expect(parseBlocks('/* nothing here */')).toEqual([]);
  });
});
