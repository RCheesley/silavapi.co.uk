import { describe, it, expect } from 'vitest';
import site from '../../src/_data/site.js';
import nav from '../../src/_data/nav.js';

describe('site data - identity rules', () => {
  it('spells the name with correct diacritics', () => {
    expect(site.name).toBe('Sīlavāpi');
  });

  it('keeps "Ruth Cheesley" as alternateName for findability', () => {
    expect(site.alternateName).toBe('Ruth Cheesley');
  });

  it('uses the https silavapi.co.uk canonical origin', () => {
    expect(site.url).toBe('https://silavapi.co.uk');
  });

  it('declares British English', () => {
    expect(site.lang).toBe('en-GB');
    expect(site.locale).toBe('en_GB');
  });

  it('states the full privacy pledge (no cookies, trackers, or third parties)', () => {
    expect(site.privacyPledge.toLowerCase()).toContain('no cookies');
    expect(site.privacyPledge.toLowerCase()).toContain('no trackers');
    expect(site.privacyPledge.toLowerCase()).toContain('nothing from third parties');
  });
});

describe('primary navigation', () => {
  it('is flat (every item has a label and href, no children)', () => {
    for (const item of nav.primary) {
      expect(item.label).toBeTruthy();
      expect(item.href).toBeTruthy();
      expect(item).not.toHaveProperty('children');
    }
  });

  it('exposes the expected flat structure: Home, About, Dharma, Blog, Contact', () => {
    expect(nav.primary.map((i) => i.key)).toEqual(['home', 'about', 'dharma', 'blog', 'contact']);
  });

  it('has unique keys', () => {
    const keys = nav.primary.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
