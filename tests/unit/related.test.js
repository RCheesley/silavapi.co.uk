import { describe, it, expect } from 'vitest';
import { relatedPosts } from '../../lib/related.js';

const post = (url, category, tags) => ({ url, data: { category, tags } });

describe('relatedPosts', () => {
  const posts = [
    post('/a/', 'Buddhism', ['meditation']),
    post('/b/', 'Mautic', ['marketing']),
    post('/c/', 'Buddhism', ['sangha']),
    post('/d/', 'Buddhism', ['meditation', 'sangha']),
    post('/e/', 'Marketing'),
  ];

  it('excludes the current post', () => {
    const out = relatedPosts(posts, '/a/', 'Buddhism', ['meditation']);
    expect(out.map((p) => p.url)).not.toContain('/a/');
  });

  it('ranks shared category, and shared tags above category alone', () => {
    // current = /a/ (Buddhism, meditation). /d/ shares category + the meditation
    // tag (score 3), /c/ shares category only (2), then /b/,/e/ (0).
    const out = relatedPosts(posts, '/a/', 'Buddhism', ['meditation'], 3);
    expect(out.map((p) => p.url)).toEqual(['/d/', '/c/', '/b/']);
  });

  it('tops up with the most recent when fewer are related (never sparse)', () => {
    // Nothing shares category/tags → all score 0 → original order, capped at limit.
    const out = relatedPosts(posts, '/a/', 'Nonexistent', ['none'], 3);
    expect(out.map((p) => p.url)).toEqual(['/b/', '/c/', '/d/']);
  });

  it('matches tags and category case-insensitively', () => {
    const out = relatedPosts(posts, '/a/', 'buddhism', ['MEDITATION'], 2);
    expect(out.map((p) => p.url)).toEqual(['/d/', '/c/']);
  });

  it('respects the limit and defaults to 3', () => {
    expect(relatedPosts(posts, '/a/', 'Buddhism', [], 1)).toHaveLength(1);
    expect(relatedPosts(posts, '/a/', 'Buddhism', [])).toHaveLength(3);
    expect(relatedPosts(posts, '/a/', 'Buddhism', [], 0)).toHaveLength(0);
  });

  it('is safe with empty/invalid inputs and posts lacking data', () => {
    expect(relatedPosts()).toEqual([]);
    expect(relatedPosts([null, post('/x/')], '/x/')).toEqual([]);
    // no category and no tags → everything scores 0, still returns up to limit
    expect(relatedPosts(posts, '/a/').map((p) => p.url)).toEqual(['/b/', '/c/', '/d/']);
    // a candidate with no `data` object at all still scores 0 without throwing
    expect(relatedPosts([{ url: '/f/' }, post('/a/', 'Buddhism')], '/a/', 'Buddhism', [])).toEqual([
      { url: '/f/' },
    ]);
  });
});
