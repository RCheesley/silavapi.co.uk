import { describe, it, expect } from 'vitest';
import { renderGallery } from '../../lib/gallery.js';

describe('renderGallery', () => {
  it('returns empty string for no/empty/invalid/null input', () => {
    expect(renderGallery()).toBe('');
    expect(renderGallery(null)).toBe('');
    expect(renderGallery([])).toBe('');
    expect(renderGallery([{ alt: 'no src' }, null])).toBe('');
  });

  it('renders an empty alt when an item has no alt text', () => {
    expect(renderGallery([{ src: '/a.jpg' }])).toContain('alt=""');
  });

  it('renders a div grid with a figure + lazy image per item (no redundant list role)', () => {
    const html = renderGallery([{ src: '/a.jpg', alt: 'A' }]);
    expect(html).toContain('<div class="gallery">');
    expect(html).not.toContain('role="list"');
    expect(html).toContain('<figure class="gallery__figure">');
    expect(html).toContain('<a class="gallery__link" href="/a.jpg">');
    expect(html).toContain('src="/a.jpg"');
    expect(html).toContain('alt="A"');
    expect(html).toContain('loading="lazy"');
  });

  it('includes a figcaption only when a non-blank caption is given', () => {
    expect(renderGallery([{ src: '/a.jpg', alt: 'A', caption: 'Hi' }])).toContain(
      '<figcaption class="gallery__caption">Hi</figcaption>'
    );
    expect(renderGallery([{ src: '/a.jpg', alt: 'A', caption: '  ' }])).not.toContain('figcaption');
    expect(renderGallery([{ src: '/a.jpg', alt: 'A' }])).not.toContain('figcaption');
  });

  it('escapes HTML in src, alt and caption', () => {
    const html = renderGallery([
      { src: '/x.jpg?a=1&b=2', alt: 'Quote "&" <tag>', caption: '<b>bold</b> & "x"' },
    ]);
    expect(html).toContain('src="/x.jpg?a=1&amp;b=2"');
    expect(html).toContain('alt="Quote &quot;&amp;&quot; &lt;tag&gt;"');
    expect(html).toContain('&lt;b&gt;bold&lt;/b&gt; &amp; &quot;x&quot;');
    expect(html).not.toContain('<b>bold</b>');
  });

  it('renders one item per valid entry, in order', () => {
    const html = renderGallery([
      { src: '/1.jpg', alt: 'one' },
      { src: '/2.jpg', alt: 'two' },
    ]);
    expect((html.match(/gallery__figure/g) || []).length).toBe(2);
    expect(html.indexOf('/1.jpg')).toBeLessThan(html.indexOf('/2.jpg'));
  });
});
