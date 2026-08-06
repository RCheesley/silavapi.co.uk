import { describe, it, expect } from 'vitest';
import { validateSubmission, isSpam, MIN_FILL_MS, LIMITS } from '../../lib/contact.js';

describe('validateSubmission', () => {
  const good = { name: 'Sīlavāpi', email: 'hello@example.com', message: 'Hi there!' };

  it('accepts a well-formed submission and trims values', () => {
    const r = validateSubmission({ name: '  Ada ', email: ' a@b.co ', message: ' hi ' });
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual({});
    expect(r.values).toEqual({ name: 'Ada', email: 'a@b.co', message: 'hi' });
  });

  it('requires all three fields', () => {
    const r = validateSubmission({});
    expect(r.ok).toBe(false);
    expect(Object.keys(r.errors).sort()).toEqual(['email', 'message', 'name']);
  });

  it('rejects a malformed email', () => {
    const r = validateSubmission({ ...good, email: 'not-an-email' });
    expect(r.ok).toBe(false);
    expect(r.errors.email).toBeTruthy();
  });

  it('rejects over-long fields', () => {
    const r = validateSubmission({ ...good, message: 'x'.repeat(LIMITS.message + 1) });
    expect(r.ok).toBe(false);
    expect(r.errors.message).toBeTruthy();
  });

  it('is safe with no argument', () => {
    expect(validateSubmission().ok).toBe(false);
  });
});

describe('isSpam', () => {
  it('flags a filled honeypot', () => {
    expect(isSpam({ website: 'http://spam' })).toBe(true);
  });

  it('flags a submit faster than a human could manage', () => {
    const now = 1_000_000;
    expect(isSpam({ _started: String(now - (MIN_FILL_MS - 500)) }, now)).toBe(true);
  });

  it('allows a submit after the minimum fill time', () => {
    const now = 1_000_000;
    expect(isSpam({ _started: String(now - (MIN_FILL_MS + 5000)) }, now)).toBe(false);
  });

  it('does not penalise a missing or malformed time-trap (e.g. no-JS)', () => {
    expect(isSpam({})).toBe(false);
    expect(isSpam({ _started: '' })).toBe(false);
    expect(isSpam({ _started: 'nope' })).toBe(false);
  });

  it('is safe with no argument', () => {
    expect(isSpam()).toBe(false);
  });
});
