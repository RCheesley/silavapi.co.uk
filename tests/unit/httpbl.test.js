import { describe, it, expect } from 'vitest';
import { httpblQueryName, interpretHttpbl, httpblIsSpam } from '../../lib/httpbl.js';

const KEY = 'abcdefghijkl'; // 12 lowercase letters, the http:BL key format

describe('httpblQueryName', () => {
  it('builds the reversed-octet query name for an IPv4 address', () => {
    expect(httpblQueryName('127.94.0.1', KEY)).toBe(`${KEY}.1.0.94.127.dnsbl.httpbl.org`);
  });

  it('returns null for a missing or malformed access key', () => {
    expect(httpblQueryName('1.2.3.4', '')).toBeNull();
    expect(httpblQueryName('1.2.3.4', 'TOOSHORT')).toBeNull();
    expect(httpblQueryName('1.2.3.4', 'abcdefghijk1')).toBeNull(); // digit not allowed
    expect(httpblQueryName('1.2.3.4', undefined)).toBeNull();
  });

  it('returns null for non-IPv4 input (incl. IPv6, which http:BL cannot check)', () => {
    expect(httpblQueryName('2001:db8::1', KEY)).toBeNull();
    expect(httpblQueryName('not-an-ip', KEY)).toBeNull();
    expect(httpblQueryName('', KEY)).toBeNull();
    expect(httpblQueryName('1.2.3.999', KEY)).toBeNull(); // octet out of range
  });
});

describe('interpretHttpbl', () => {
  it('decodes days, threat and the visitor-type bitmask', () => {
    expect(interpretHttpbl('127.1.20.4')).toEqual({
      days: 1,
      threat: 20,
      searchEngine: false,
      suspicious: false,
      harvester: false,
      commentSpammer: true,
    });
  });

  it('flags a combined harvester + comment spammer (type 6)', () => {
    const r = interpretHttpbl('127.5.50.6');
    expect(r.harvester).toBe(true);
    expect(r.commentSpammer).toBe(true);
    expect(r.suspicious).toBe(false);
  });

  it('marks a search engine (type 0)', () => {
    expect(interpretHttpbl('127.0.0.0').searchEngine).toBe(true);
  });

  it('returns null for a non-listing record or garbage', () => {
    expect(interpretHttpbl('10.0.0.1')).toBeNull(); // does not start with 127
    expect(interpretHttpbl('nope')).toBeNull();
    expect(interpretHttpbl('')).toBeNull();
  });

  it('returns null when an octet is out of the 0-255 range', () => {
    expect(interpretHttpbl('127.1.999.4')).toBeNull();
    expect(interpretHttpbl('127.300.0.0')).toBeNull();
  });
});

describe('httpblIsSpam', () => {
  it('never treats a search engine as spam', () => {
    expect(httpblIsSpam(interpretHttpbl('127.0.0.0'))).toBe(false);
  });

  it('treats a comment spammer or harvester as spam regardless of score', () => {
    expect(httpblIsSpam(interpretHttpbl('127.1.0.4'))).toBe(true); // comment spammer, threat 0
    expect(httpblIsSpam(interpretHttpbl('127.1.0.2'))).toBe(true); // harvester, threat 0
  });

  it('uses the threat threshold for merely suspicious IPs', () => {
    expect(httpblIsSpam(interpretHttpbl('127.1.10.1'))).toBe(false); // suspicious, threat 10 < 25
    expect(httpblIsSpam(interpretHttpbl('127.1.30.1'))).toBe(true); // suspicious, threat 30 >= 25
    expect(httpblIsSpam(interpretHttpbl('127.1.30.1'), { minThreat: 40 })).toBe(false);
  });

  it('does not apply the threat threshold to a non-suspicious listing', () => {
    // An unrecognised type bit (not search engine / suspicious / harvester /
    // comment spammer) is treated conservatively - not spam - even at high score.
    expect(httpblIsSpam(interpretHttpbl('127.1.200.8'))).toBe(false);
  });

  it('returns false for a null/unlisted result', () => {
    expect(httpblIsSpam(null)).toBe(false);
  });
});
