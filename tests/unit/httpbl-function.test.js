import { describe, it, expect, vi } from 'vitest';
import { checkHttpblSpam } from '../../functions/api/_httpbl.js';

const KEY = 'abcdefghijkl';

// A request carrying a given client IP header.
const req = (ip) =>
  new Request('https://silavapi.co.uk/api/contact', {
    method: 'POST',
    headers: ip ? { 'CF-Connecting-IP': ip } : {},
  });

// A fake DoH fetch returning the given A-record data (or NXDOMAIN when null).
const dohReturning = (data) =>
  vi.fn(async () =>
    Response.json(data ? { Status: 0, Answer: [{ type: 1, data }] } : { Status: 3, Answer: [] })
  );

describe('checkHttpblSpam', () => {
  it('is disabled (false) when no access key is configured', async () => {
    const fetchImpl = vi.fn();
    expect(await checkHttpblSpam(req('1.2.3.4'), {}, { fetchImpl })).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled(); // no lookup at all
  });

  it('returns false for an IPv6 client (http:BL cannot check it)', async () => {
    const fetchImpl = vi.fn();
    expect(
      await checkHttpblSpam(req('2001:db8::1'), { HTTPBL_ACCESS_KEY: KEY }, { fetchImpl })
    ).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('flags a listed comment spammer', async () => {
    const fetchImpl = dohReturning('127.2.40.4'); // comment spammer, threat 40
    expect(await checkHttpblSpam(req('9.9.9.9'), { HTTPBL_ACCESS_KEY: KEY }, { fetchImpl })).toBe(
      true
    );
    // Queried the reversed-octet http:BL name via DoH.
    expect(fetchImpl.mock.calls[0][0]).toContain(`${KEY}.9.9.9.9.dnsbl.httpbl.org`);
  });

  it('does not flag an unlisted IP (NXDOMAIN)', async () => {
    expect(
      await checkHttpblSpam(
        req('9.9.9.9'),
        { HTTPBL_ACCESS_KEY: KEY },
        { fetchImpl: dohReturning(null) }
      )
    ).toBe(false);
  });

  it('respects a custom HTTPBL_MIN_THREAT for a merely suspicious IP', async () => {
    const env = { HTTPBL_ACCESS_KEY: KEY, HTTPBL_MIN_THREAT: '80' };
    // suspicious (type 1), threat 40 -> below the raised threshold -> not spam
    expect(
      await checkHttpblSpam(req('9.9.9.9'), env, { fetchImpl: dohReturning('127.1.40.1') })
    ).toBe(false);
  });

  it('treats a blank HTTPBL_MIN_THREAT as unset (falls back to the default)', async () => {
    const env = { HTTPBL_ACCESS_KEY: KEY, HTTPBL_MIN_THREAT: '' };
    // Suspicious (type 1), threat 20 -> below the default 25 -> not spam. If ''
    // were parsed as 0 this would wrongly flag it.
    expect(
      await checkHttpblSpam(req('9.9.9.9'), env, { fetchImpl: dohReturning('127.1.20.1') })
    ).toBe(false);
  });

  it('clamps HTTPBL_MIN_THREAT above 255 down to 255', async () => {
    // 9999 clamps to 255, so a suspicious IP at the max score (255) is still spam.
    // Without clamping, minThreat would be 9999 and 255 >= 9999 would be false.
    const env = { HTTPBL_ACCESS_KEY: KEY, HTTPBL_MIN_THREAT: '9999' };
    expect(
      await checkHttpblSpam(req('9.9.9.9'), env, { fetchImpl: dohReturning('127.1.255.1') })
    ).toBe(true);
  });

  it('fails open when the lookup errors', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('network down');
    });
    expect(await checkHttpblSpam(req('9.9.9.9'), { HTTPBL_ACCESS_KEY: KEY }, { fetchImpl })).toBe(
      false
    );
  });

  it('fails open on a non-OK DoH response', async () => {
    const fetchImpl = vi.fn(async () => new Response('nope', { status: 502 }));
    expect(await checkHttpblSpam(req('9.9.9.9'), { HTTPBL_ACCESS_KEY: KEY }, { fetchImpl })).toBe(
      false
    );
  });
});
