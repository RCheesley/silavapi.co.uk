import { describe, it, expect } from 'vitest';
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
});
