/**
 * _httpbl.js - the network side of the Project Honeypot http:BL check for the
 * contact form. Cloudflare Workers can't do raw DNS, so the http:BL hostname is
 * resolved via DNS-over-HTTPS (Cloudflare's own resolver). This runs only when
 * the form is submitted - no browser request, no cookie; the visitor's IP is
 * shared with Project Honeypot's DNS at that point (which is the whole point of
 * an IP-reputation check).
 *
 * Fail-open by design: a missing key, an IPv6 address, a lookup error or a
 * timeout all return false, so a genuine message is never dropped because the
 * check couldn't run. Pure decoding lives in lib/httpbl.js.
 */
import { httpblQueryName, interpretHttpbl, httpblIsSpam } from '../../lib/httpbl.js';

const DOH_URL = 'https://cloudflare-dns.com/dns-query';

/**
 * @param {Request} request - the incoming Pages Function request
 * @param {Record<string,string>} env
 * @param {{fetchImpl?:typeof fetch, timeoutMs?:number}} [opts] - fetchImpl is injectable for tests
 * @returns {Promise<boolean>} true only when the client IP is confidently spam
 */
export async function checkHttpblSpam(request, env, { fetchImpl = fetch, timeoutMs = 1500 } = {}) {
  try {
    const key = env.HTTPBL_ACCESS_KEY;
    if (!key) return false; // not configured -> disabled
    const ip = request.headers.get('CF-Connecting-IP');
    const name = httpblQueryName(ip, key);
    if (!name) return false; // not a checkable IPv4 address

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let record = null;
    try {
      const res = await fetchImpl(`${DOH_URL}?name=${encodeURIComponent(name)}&type=A`, {
        headers: { accept: 'application/dns-json' },
        signal: controller.signal,
      });
      if (!res.ok) return false;
      const data = await res.json();
      const answers = Array.isArray(data && data.Answer) ? data.Answer : [];
      const a = answers.find((r) => r && r.type === 1); // 1 = A record
      record = a ? a.data : null; // no answer (NXDOMAIN) -> not listed
    } finally {
      clearTimeout(timer);
    }
    if (!record) return false;

    // Blank/whitespace is "unset" (Number('') === 0 would flag every suspicious
    // IP as spam), so fall back to the default threshold.
    const raw = String(env.HTTPBL_MIN_THREAT ?? '').trim();
    const parsed = raw === '' ? NaN : Number(raw);
    // Clamp into the documented 0-255 range so a stray value can't make the
    // filter overly aggressive (e.g. -1) or inert (e.g. 9999).
    const minThreat = Number.isFinite(parsed) ? Math.min(255, Math.max(0, parsed)) : 25;
    return httpblIsSpam(interpretHttpbl(record), { minThreat });
  } catch {
    return false; // fail open
  }
}
