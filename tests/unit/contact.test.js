import { describe, it, expect } from 'vitest';
import {
  validateSubmission,
  validateSpeakerEnquiry,
  formatSpeakerMessage,
  formatEventDate,
  isSpam,
  MIN_FILL_MS,
  LIMITS,
} from '../../lib/contact.js';

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

describe('validateSpeakerEnquiry', () => {
  const good = { name: 'Ada', email: 'a@b.co', event: 'FOSDEM', topic: 'Digital sovereignty' };

  it('accepts a complete enquiry (dates optional) and trims all fields', () => {
    const r = validateSpeakerEnquiry({ ...good, location: '  Brussels ' });
    expect(r.ok).toBe(true);
    expect(r.values.location).toBe('Brussels');
  });

  it('requires name, email, event and topic (dates are optional)', () => {
    const r = validateSpeakerEnquiry({});
    expect(r.ok).toBe(false);
    expect(Object.keys(r.errors).sort()).toEqual(['email', 'event', 'name', 'topic']);
  });

  it('rejects a bad email', () => {
    expect(validateSpeakerEnquiry({ ...good, email: 'nope' }).ok).toBe(false);
  });

  it('is safe with no argument', () => {
    expect(validateSpeakerEnquiry().ok).toBe(false);
  });
});

describe('formatEventDate', () => {
  it('renders a single day, a range, and a flexible fallback', () => {
    expect(formatEventDate({ date_start: '2027-02-06' })).toBe('2027-02-06');
    expect(formatEventDate({ date_start: '2027-02-06', date_end: '2027-02-08' })).toBe(
      '2027-02-06 to 2027-02-08'
    );
    expect(formatEventDate({})).toBe('Not set / flexible');
  });
});

describe('formatSpeakerMessage', () => {
  it('renders every field, with a dash for the blanks', () => {
    const text = formatSpeakerMessage({ event: 'FOSDEM', date_start: '2027-02-06', topic: 'OSS' });
    expect(text).toContain('Event / organisation: FOSDEM');
    expect(text).toContain('Date: 2027-02-06');
    expect(text).toContain('Location: —');
    expect(text).toContain('Topic / what to speak about:');
    expect(text).toContain('OSS');
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
