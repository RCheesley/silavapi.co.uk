import { describe, it, expect } from 'vitest';
import { categorySlug } from '../../lib/slug.js';

describe('categorySlug', () => {
  it('lower-cases a single word', () => {
    expect(categorySlug('Buddhism')).toBe('buddhism');
  });

  it('replaces spaces with hyphens', () => {
    expect(categorySlug('Digital Sovereignty')).toBe('digital-sovereignty');
    expect(categorySlug('Being bendy')).toBe('being-bendy');
    expect(categorySlug('Personal development')).toBe('personal-development');
  });

  it('collapses runs of non-alphanumerics and trims edge hyphens', () => {
    expect(categorySlug('  Open   source!  ')).toBe('open-source');
    expect(categorySlug('C++ & friends')).toBe('c-friends');
  });

  it('coerces non-string input', () => {
    expect(categorySlug(42)).toBe('42');
  });
});
