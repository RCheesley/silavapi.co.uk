import { describe, it, expect, vi, afterEach } from 'vitest';
import { onRequestPost } from '../../functions/api/comment.js';
import { onRequestGet } from '../../functions/api/approve.js';
import { signApproval } from '../../lib/comments.js';

function formRequest(fields, { json = false } = {}) {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.set(k, v);
  return new Request('https://silavapi.co.uk/api/comment', {
    method: 'POST',
    headers: json ? { accept: 'application/json' } : {},
    body,
  });
}

const ENV = {
  GITHUB_TOKEN: 't',
  GITHUB_REPO: 'owner/repo',
  COMMENT_SECRET: 'shhh',
  SITE_URL: 'https://silavapi.co.uk',
  RESEND_API_KEY: 'k',
  CONTACT_TO: 'to@x',
  CONTACT_FROM: 'from@x',
};
const valid = { name: 'Ada', comment: 'Lovely post', slug: 'introducing-silavapi' };

describe('POST /api/comment', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('silently accepts spam (honeypot) and stores nothing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const res = await onRequestPost({ request: formRequest({ ...valid, website: 'x' }), env: ENV });
    expect(res.status).toBe(303);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 422 for an invalid comment', async () => {
    const res = await onRequestPost({
      request: formRequest({ slug: 'introducing-silavapi', name: '', comment: '' }, { json: true }),
      env: ENV,
    });
    expect(res.status).toBe(422);
    expect((await res.json()).errors.name).toBeTruthy();
  });

  it('reports 503 when the store is not configured', async () => {
    const res = await onRequestPost({ request: formRequest(valid, { json: true }), env: {} });
    expect(res.status).toBe(503);
  });

  it('commits a pending comment file and emails a signed approve link', async () => {
    const calls = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, opts) => {
        calls.push({ url: String(url), method: opts?.method, body: opts?.body });
        return new Response('{}', { status: 200 });
      })
    );
    const res = await onRequestPost({ request: formRequest(valid, { json: true }), env: ENV });
    expect(res.status).toBe(200);
    expect((await res.json()).pending).toBe(true);

    const gh = calls.find((c) => c.url.includes('api.github.com'));
    expect(gh.method).toBe('PUT');
    expect(gh.url).toContain('/contents/src/_data/comments/introducing-silavapi/');

    const mail = calls.find((c) => c.url.includes('resend.com'));
    expect(mail.body).toContain('/api/approve?slug=introducing-silavapi');
  });
});

describe('GET /api/approve', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('rejects a tampered/invalid signature', async () => {
    const req = new Request('https://x/api/approve?slug=post&id=abc123&sig=deadbeef');
    const res = await onRequestGet({ request: req, env: ENV });
    expect(res.status).toBe(403);
  });

  it('rejects a malformed id', async () => {
    const req = new Request('https://x/api/approve?slug=post&id=../x&sig=y');
    const res = await onRequestGet({ request: req, env: ENV });
    expect(res.status).toBe(400);
  });

  it('flips approved to true with a valid signature', async () => {
    const sig = await signApproval(ENV.COMMENT_SECRET, 'post:abc123');
    let put = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, opts) => {
        const method = opts?.method || 'GET';
        if (method === 'GET') {
          const content = btoa(JSON.stringify({ id: 'abc123', approved: false }));
          return new Response(JSON.stringify({ sha: 'sha1', content }), { status: 200 });
        }
        put = JSON.parse(opts.body);
        return new Response('{}', { status: 200 });
      })
    );
    const req = new Request(`https://x/api/approve?slug=post&id=abc123&sig=${sig}`);
    const res = await onRequestGet({ request: req, env: ENV });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('approved');
    // the committed file now has approved: true
    const written = JSON.parse(
      new TextDecoder().decode(Uint8Array.from(atob(put.content), (c) => c.charCodeAt(0)))
    );
    expect(written.approved).toBe(true);
  });
});
