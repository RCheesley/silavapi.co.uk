import { describe, it, expect } from 'vitest';
import { renderTalksMap } from '../../lib/world-map.js';

describe('renderTalksMap', () => {
  it('returns an inline SVG with an accessible label', () => {
    const svg = renderTalksMap(['gb']);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="World map highlighting the 1 countries');
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
