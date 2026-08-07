import { describe, it, expect } from 'vitest';
import {
  validateComment,
  buildComment,
  countComments,
  threadComments,
  signApproval,
  verifyApproval,
  COMMENT_LIMITS,
} from '../../lib/comments.js';

describe('validateComment', () => {
  const good = { name: 'Ada', comment: 'Lovely post!', slug: 'introducing-silavapi' };

  it('accepts a valid comment (email optional) and trims', () => {
    const r = validateComment({ ...good, name: '  Ada  ', comment: '  hi  ' });
    expect(r.ok).toBe(true);
    expect(r.values.name).toBe('Ada');
    expect(r.values.comment).toBe('hi');
  });

  it('requires a name, a comment and a valid slug', () => {
    const r = validateComment({});
    expect(r.ok).toBe(false);
    expect(Object.keys(r.errors).sort()).toEqual(['comment', 'name', 'slug']);
  });

  it('rejects an invalid slug', () => {
    expect(validateComment({ ...good, slug: '../etc' }).errors.slug).toBeTruthy();
    expect(validateComment({ ...good, slug: 'Bad Slug' }).errors.slug).toBeTruthy();
  });

  it('checks email only when provided', () => {
    expect(validateComment({ ...good, email: '' }).ok).toBe(true);
    expect(validateComment({ ...good, email: 'nope' }).errors.email).toBeTruthy();
    expect(
      validateComment({ ...good, email: 'x'.repeat(COMMENT_LIMITS.email) + '@e.co' }).errors.email
    ).toBeTruthy();
    expect(validateComment({ ...good, email: 'a@b.co' }).ok).toBe(true);
  });

  it('rejects over-long name and comment', () => {
    expect(
      validateComment({ ...good, name: 'x'.repeat(COMMENT_LIMITS.name + 1) }).errors.name
    ).toBeTruthy();
    expect(
      validateComment({ ...good, comment: 'x'.repeat(COMMENT_LIMITS.body + 1) }).errors.comment
    ).toBeTruthy();
  });

  it('is safe with no argument', () => {
    expect(validateComment().ok).toBe(false);
  });
});

describe('buildComment', () => {
  it('stores id/name/body/date, defaults parent to null, and never stores email', () => {
    const c = buildComment(
      { name: 'Ada', comment: 'Hi', email: 'a@b.co' },
      { id: 'x1', date: '2026-08-07' }
    );
    expect(c).toEqual({
      id: 'x1',
      parent: null,
      name: 'Ada',
      body: 'Hi',
      date: '2026-08-07',
      approved: false,
    });
    expect(c).not.toHaveProperty('email');
  });

  it('keeps a parent id when replying', () => {
    expect(
      buildComment({ name: 'A', comment: 'B', parent: 'root1' }, { id: 'r1', date: 'd' }).parent
    ).toBe('root1');
  });
});

describe('countComments / threadComments', () => {
  const data = {
    a: { id: 'a', parent: null, name: 'A', body: '1', date: '2026-01-01', approved: true },
    b: { id: 'b', parent: 'a', name: 'B', body: '2', date: '2026-01-03', approved: true },
    c: { id: 'c', parent: 'a', name: 'C', body: '3', date: '2026-01-02', approved: true },
    d: { id: 'd', parent: null, name: 'D', body: '4', date: '2026-01-05', approved: false },
    e: { id: 'e', parent: 'missing', name: 'E', body: '5', date: '2026-01-04', approved: true },
  };

  it('counts only approved comments', () => {
    expect(countComments(data)).toBe(4); // a,b,c,e (d unapproved)
    expect(countComments()).toBe(0);
    expect(countComments(null)).toBe(0);
    expect(threadComments(null)).toEqual([]);
  });

  it('keeps a stable order for comments posted at the same instant', () => {
    const same = {
      p: { id: 'p', parent: null, name: 'P', body: '1', date: '2026-02-02', approved: true },
      q: { id: 'q', parent: null, name: 'Q', body: '2', date: '2026-02-02', approved: true },
    };
    expect(threadComments(same).map((r) => r.id)).toEqual(['p', 'q']);
  });

  it('threads replies under parents, sorts by date, orphans become roots', () => {
    const roots = threadComments(data);
    // roots: a (2026-01-01) and e (orphan, parent unapproved/missing) sorted by date
    expect(roots.map((r) => r.id)).toEqual(['a', 'e']);
    // a's replies sorted by date: c (01-02) before b (01-03)
    expect(roots[0].replies.map((r) => r.id)).toEqual(['c', 'b']);
    expect(roots[1].replies).toEqual([]);
  });

  it('accepts an array as well as an object', () => {
    expect(countComments(Object.values(data))).toBe(4);
    expect(threadComments(Object.values(data)).length).toBe(2);
  });
});

describe('signApproval / verifyApproval', () => {
  it('produces a hex signature and verifies it', async () => {
    const sig = await signApproval('secret', 'introducing-silavapi:x1');
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
    expect(await verifyApproval('secret', 'introducing-silavapi:x1', sig)).toBe(true);
  });

  it('rejects a wrong signature, wrong secret, or wrong length', async () => {
    const sig = await signApproval('secret', 'p');
    expect(await verifyApproval('secret', 'p', sig.replace(/.$/, '0'))).toBe(false);
    expect(await verifyApproval('other', 'p', sig)).toBe(false);
    expect(await verifyApproval('secret', 'p', 'short')).toBe(false);
    expect(await verifyApproval('secret', 'p', '')).toBe(false);
  });
});
