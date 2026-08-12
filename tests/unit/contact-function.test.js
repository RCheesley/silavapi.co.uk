import { describe, it, expect, vi, afterEach } from 'vitest';
import { onRequestPost } from '../../functions/api/contact.js';

// Build a Pages-Function-style POST request from form fields.
function formRequest(fields, { json = false } = {}) {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.set(k, v);
  return new Request('https://silavapi.co.uk/api/contact', {
    method: 'POST',
    headers: json ? { accept: 'application/json' } : {},
    body,
  });
}

const CONFIGURED = { CONTACT_TO: 'hello@x', CONTACT_FROM: 'form@x', RESEND_API_KEY: 'k' };
const valid = { name: 'Ada', email: 'a@b.co', message: 'Hello' };

describe('POST /api/contact', () => {
  it('silently accepts spam (honeypot) without delivering', async () => {
    const res = await onRequestPost({ request: formRequest({ ...valid, website: 'x' }), env: {} });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/thank-you/');
  });

  it('redirects invalid native submissions back to the form', async () => {
    const res = await onRequestPost({
      request: formRequest({ name: '', email: 'no', message: '' }),
      env: CONFIGURED,
    });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/contact/?error=1');
  });

  it('returns 422 JSON with field errors for an invalid fetch submission', async () => {
    const res = await onRequestPost({
      request: formRequest({ name: '', email: 'no', message: '' }, { json: true }),
      env: CONFIGURED,
    });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.errors.email).toBeTruthy();
  });

  it('reports 503 when delivery is not configured', async () => {
    const res = await onRequestPost({ request: formRequest(valid, { json: true }), env: {} });
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.ok).toBe(false);
  });

  it('routes a speaker enquiry: invalid one bounces back to /speaking/book/', async () => {
    const res = await onRequestPost({
      request: formRequest({ _form: 'speaking', name: 'Ada', email: 'a@b.co' }),
      env: CONFIGURED,
    });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/speaking/book/?error=1');
  });

  it('accepts a complete speaker enquiry with a date range (503 only because delivery is unconfigured)', async () => {
    const res = await onRequestPost({
      request: formRequest(
        {
          _form: 'speaking',
          name: 'Ada',
          email: 'a@b.co',
          event: 'FOSDEM',
          date_start: '2027-02-06',
          date_end: '2027-02-08',
          topic: 'OSS',
        },
        { json: true }
      ),
      env: {},
    });
    expect(res.status).toBe(503); // validation passed; only delivery is unconfigured
  });

  it('silently drops a submission from an http:BL-listed IP, without delivering', async () => {
    // Stub the DoH lookup to report a comment spammer. Delivery would use fetch
    // too, so if we reach it the stub would see a second (Resend) call.
    const fetchImpl = vi.fn(async () =>
      Response.json({ Status: 0, Answer: [{ type: 1, data: '127.2.40.4' }] })
    );
    vi.stubGlobal('fetch', fetchImpl);

    const request = new Request('https://silavapi.co.uk/api/contact', {
      method: 'POST',
      headers: { accept: 'application/json', 'CF-Connecting-IP': '9.9.9.9' },
      body: (() => {
        const b = new FormData();
        for (const [k, v] of Object.entries(valid)) b.set(k, v);
        return b;
      })(),
    });

    const res = await onRequestPost({
      request,
      env: { ...CONFIGURED, HTTPBL_ACCESS_KEY: 'abcdefghijkl' },
    });

    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true); // looks like success to the bot
    // Only the http:BL DoH lookup ran - the message was never sent on.
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toContain('dnsbl.httpbl.org');
  });

  it('validates before http:BL: an invalid submission still gets errors, no lookup', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ Status: 0, Answer: [{ type: 1, data: '127.2.40.4' }] })
    );
    vi.stubGlobal('fetch', fetchImpl);

    const request = new Request('https://silavapi.co.uk/api/contact', {
      method: 'POST',
      headers: { accept: 'application/json', 'CF-Connecting-IP': '9.9.9.9' },
      body: (() => {
        const b = new FormData();
        b.set('name', '');
        b.set('email', 'no');
        b.set('message', '');
        return b;
      })(),
    });

    const res = await onRequestPost({
      request,
      env: { ...CONFIGURED, HTTPBL_ACCESS_KEY: 'abcdefghijkl' },
    });

    expect(res.status).toBe(422); // validation errors, not a silent accept
    expect(fetchImpl).not.toHaveBeenCalled(); // no http:BL lookup for an invalid submission
  });
});

afterEach(() => vi.unstubAllGlobals());
