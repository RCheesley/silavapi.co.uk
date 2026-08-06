import { describe, it, expect } from 'vitest';
import {
  byCategories,
  byTags,
  groupByYear,
  presentationsOf,
  presentationCountries,
} from '../../lib/talks.js';

const post = (category, tags = []) => ({ data: { category, tags } });

describe('byCategories', () => {
  const posts = [post('Open source'), post('Mautic'), post('Dharma')];
  it('keeps only posts in the wanted categories', () => {
    const out = byCategories(posts, ['Open source', 'Mautic']);
    expect(out.map((p) => p.data.category)).toEqual(['Open source', 'Mautic']);
  });
  it('returns nothing when no category matches', () => {
    expect(byCategories(posts, ['Nope'])).toEqual([]);
  });
  it('is safe with null inputs', () => {
    expect(byCategories(null, null)).toEqual([]);
  });
});

describe('byTags', () => {
  const posts = [post('a', ['Open source', 'Mautic']), post('b', ['dharma']), post('c', [])];
  it('matches case-insensitively on any shared tag', () => {
    const out = byTags(posts, ['mautic']);
    expect(out).toHaveLength(1);
    expect(out[0].data.category).toBe('a');
  });
  it('returns [] when the wanted-tags list is empty', () => {
    expect(byTags(posts, [])).toEqual([]);
  });
  it('returns [] when nothing shares a tag', () => {
    expect(byTags(posts, ['unused'])).toEqual([]);
  });
  it('is safe with null inputs', () => {
    expect(byTags(null, null)).toEqual([]);
  });
});

describe('groupByYear', () => {
  it('groups by year, newest year first', () => {
    const items = [
      { date: new Date('2022-05-01'), id: 'a' },
      { date: new Date('2024-02-01'), id: 'b' },
      { date: new Date('2022-01-01'), id: 'c' },
    ];
    const groups = groupByYear(items);
    expect(groups.map((g) => g.year)).toEqual([2024, 2022]);
    expect(groups[1].items.map((i) => i.id)).toEqual(['a', 'c']);
  });
  it('returns [] for empty/null input', () => {
    expect(groupByYear()).toEqual([]);
  });
});

describe('presentationsOf', () => {
  it('emits one row per event for a multi-event talk', () => {
    const talk = {
      url: '/speaking/x/',
      date: new Date('2025-10-07'),
      data: {
        title: 'X',
        cover: '/c.jpg',
        slides: '/x.pdf',
        events: [
          { event: 'A', date: '2025-10-07', location: { country: 'gb', city: 'London' } },
          { event: 'B', date: '2025-05-21', location: null },
        ],
      },
    };
    const rows = presentationsOf([talk]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      event: 'A',
      title: 'X',
      url: '/speaking/x/',
      slides: '/x.pdf',
    });
    expect(rows[0].date).toBeInstanceOf(Date);
    expect(rows[1].location).toBeNull();
  });
  it('falls back to top-level fields when a talk has no events[]', () => {
    const talk = {
      url: '/speaking/y/',
      date: new Date('2020-01-01'),
      data: { title: 'Y', event: 'Solo', location: { country: 'us' } },
    };
    const rows = presentationsOf([talk]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ event: 'Solo', title: 'Y' });
    expect(rows[0].date).toBe(talk.date);
  });
  it('is safe with null input', () => {
    expect(presentationsOf(null)).toEqual([]);
  });
});

describe('presentationCountries', () => {
  it('returns unique lower-cased ISO codes', () => {
    const rows = [
      { location: { country: 'GB' } },
      { location: { country: 'gb' } },
      { location: { country: 'US' } },
      { location: null },
      {},
    ];
    expect(presentationCountries(rows).sort()).toEqual(['gb', 'us']);
  });
  it('is safe with null input', () => {
    expect(presentationCountries(null)).toEqual([]);
  });
});
