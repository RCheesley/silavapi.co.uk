import { describe, it, expect } from 'vitest';
import { renderTalksMap } from '../../lib/world-map.js';

describe('renderTalksMap', () => {
  it('returns an inline SVG with an accessible label', () => {
    const svg = renderTalksMap(['gb']);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('role="img"');
  });

  it('pluralises the accessible label by count', () => {
    expect(renderTalksMap(['gb'])).toContain('the 1 country where');
    expect(renderTalksMap(['gb', 'us'])).toContain('the 2 countries where');
    expect(renderTalksMap([])).toContain('the 0 countries where');
  });

  it('escapes XML-special characters in country <title> text', () => {
    // No committed country name should leak a raw & into the markup.
    const svg = renderTalksMap(['gb', 'us', 'fr', 'de']);
    expect(svg).not.toMatch(/<title>[^<]*&(?!amp;|lt;|gt;)/);
  });

  it('marks highlighted countries active (case-insensitive) and adds a title', () => {
    const svg = renderTalksMap(['GB']);
    expect(svg).toContain('talks-map__country is-active');
    // A <title> is emitted for highlighted countries (hover/AT hint).
    expect(svg).toMatch(/<title>[^<]+<\/title>/);
  });

  it('renders every country path, active or not', () => {
    const none = renderTalksMap([]);
    const some = renderTalksMap(['gb', 'us']);
    const count = (s) => (s.match(/<path /g) || []).length;
    expect(count(none)).toBeGreaterThan(100); // world has ~200 territories
    expect(count(none)).toBe(count(some)); // same paths, only classes differ
    expect(none).not.toContain('is-active');
  });

  it('is safe with no argument', () => {
    expect(renderTalksMap().startsWith('<svg')).toBe(true);
  });

  it('does not reference any third-party origin (privacy-clean)', () => {
    const svg = renderTalksMap(['gb', 'fr', 'de']);
    expect(svg).not.toMatch(/https?:\/\//);
  });
});
