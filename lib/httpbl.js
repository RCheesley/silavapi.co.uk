/**
 * httpbl.js - pure helpers for Project Honeypot's http:BL IP-reputation
 * blacklist (https://www.projecthoneypot.org/httpbl_api.php). No I/O here: this
 * builds the DNS query name and interprets the A record a lookup returns. The
 * actual DNS-over-HTTPS request lives in functions/api/_httpbl.js, so this stays
 * trivially unit-testable.
 *
 * http:BL answers with a 127.0.0.0/8 A record:
 *   octet 0: always 127 when the IP is listed
 *   octet 1: days since the IP was last seen active (0-255)
 *   octet 2: threat score (0-255; higher is worse)
 *   octet 3: visitor-type bitmask - 0 search engine, 1 suspicious,
 *            2 harvester, 4 comment spammer (bits combine)
 * An unlisted IP returns NXDOMAIN (no answer). IPv4 only - http:BL has no IPv6.
 */

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const RECORD_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/**
 * Build the http:BL DNS query name for an IPv4 address, or null when it can't be
 * queried: a missing/malformed 12-letter access key, or a non-IPv4 address
 * (http:BL doesn't support IPv6). Format is
 * `<key>.<reversed-octets>.dnsbl.httpbl.org`.
 * @param {string} ip
 * @param {string} accessKey
 * @returns {string|null}
 */
export function httpblQueryName(ip, accessKey) {
  if (typeof accessKey !== 'string' || !/^[a-z]{12}$/.test(accessKey)) return null;
  const m = IPV4_RE.exec(String(ip || '').trim());
  if (!m) return null;
  const octets = m.slice(1).map(Number);
  if (octets.some((o) => o > 255)) return null;
  return `${accessKey}.${octets[3]}.${octets[2]}.${octets[1]}.${octets[0]}.dnsbl.httpbl.org`;
}

/**
 * Interpret an http:BL A record string ("127.d.s.t"). Returns null if it isn't a
 * valid http:BL listing (a record that doesn't start with 127).
 * @param {string} aRecord
 * @returns {{days:number,threat:number,searchEngine:boolean,suspicious:boolean,harvester:boolean,commentSpammer:boolean}|null}
 */
export function interpretHttpbl(aRecord) {
  const m = RECORD_RE.exec(String(aRecord || '').trim());
  if (!m) return null;
  const [, first, days, threat, type] = m.map(Number);
  // Must be a well-formed http:BL listing: 127.x.y.z with every octet 0-255.
  if (first !== 127 || days > 255 || threat > 255 || type > 255) return null;
  return {
    days,
    threat,
    searchEngine: type === 0,
    suspicious: (type & 1) === 1,
    harvester: (type & 2) === 2,
    commentSpammer: (type & 4) === 4,
  };
}

/**
 * Decide whether an interpreted http:BL result should be treated as spam.
 * Search engines are never spam. A comment spammer or harvester is; otherwise a
 * threat score at/above the threshold is. Conservative by default so a genuine
 * message from a shared/dynamic IP with a low score is not dropped.
 * @param {ReturnType<typeof interpretHttpbl>} result
 * @param {{minThreat?:number}} [opts]
 * @returns {boolean}
 */
export function httpblIsSpam(result, { minThreat = 25 } = {}) {
  if (!result || result.searchEngine) return false;
  if (result.commentSpammer || result.harvester) return true;
  // Only apply the threat threshold to a "suspicious"-flagged listing; a listing
  // with some other/unknown type bit is treated conservatively (not spam).
  return result.suspicious && result.threat >= minThreat;
}
