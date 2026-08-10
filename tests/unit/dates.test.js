import { describe, it, expect } from 'vitest';
import { toDate, readableDate, isoDate } from '../../lib/dates.js';

describe('toDate', () => {
  it('returns the same Date instance when given a Date', () => {
    const d = new Date('2025-03-03T00:00:00Z');
    expect(toDate(d)).toBe(d);
  });

  it('coerces an ISO string to a Date', () => {
    expect(toDate('2025-03-03').getUTCFullYear()).toBe(2025);
  });

  it('coerces a numeric timestamp to a Date', () => {
    expect(toDate(0).toISOString()).toBe('1970-01-01T00:00:00.000Z');
  });
});

describe('readableDate', () => {
  it('formats a Date as "03 March, 2025"', () => {
    expect(readableDate(new Date('2025-03-03T12:00:00Z'))).toBe('03 March, 2025');
  });

  it('formats an ISO string the same way (day zero-padded)', () => {
    expect(readableDate('2026-07-20')).toBe('20 July, 2026');
  });

  it('is UTC-stable near midnight boundaries', () => {
    expect(readableDate('2026-01-01T00:00:00Z')).toBe('01 January, 2026');
  });

  it('throws a TypeError on an invalid date', () => {
    expect(() => readableDate('not-a-date')).toThrow(TypeError);
  });
});

describe('isoDate', () => {
  it('renders an ISO-8601 string with second precision (no milliseconds)', () => {
    expect(isoDate(new Date('2025-03-03T09:30:00Z'))).toBe('2025-03-03T09:30:00Z');
  });

  it('accepts a string input', () => {
    expect(isoDate('2025-03-03T00:00:00Z')).toBe('2025-03-03T00:00:00Z');
  });

  it('strips sub-second precision from the input', () => {
    expect(isoDate('2025-03-03T09:30:00.512Z')).toBe('2025-03-03T09:30:00Z');
  });

  it('throws a TypeError on an invalid date', () => {
    expect(() => isoDate('nope')).toThrow(TypeError);
  });
});
