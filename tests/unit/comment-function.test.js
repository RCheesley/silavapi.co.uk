import { describe, it, expect, vi, afterEach } from 'vitest';
import { onRequestPost } from '../../functions/api/comment.js';
import {
  onRequestGet as moderateGet,
  onRequestPost as moderatePost,
} from '../../functions/api/moderate.js';
import { signApproval, approvalPayload, APPROVAL_TTL_MS } from '../../lib/comments.js';

// A fresh issued-at timestamp for signed moderation links, plus a helper that
// signs the timestamped payload the handlers now expect.
const FRESH_TS = Date.now();
const signFor = (action, slug, id, ts = FRESH_TS) =>
  signApproval(ENV.COMMENT_SECRET, approvalPayload(action, slug, id, ts));

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

  it('silently accepts content spam (URL in the name) and stores nothing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const res = await onRequestPost({
      request: formRequest({ ...valid, name: 'http://spam.example' }, { json: true }),
      env: ENV,
    });
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for a non-form body rather than an uncaught 500', async () => {
    const req = new Request('https://silavapi.co.uk/api/comment', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: '{"not":"a form"}',
    });
    const res = await onRequestPost({ request: req, env: ENV });
    expect(res.status).toBe(400);
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

  it('sanitises the redirect Location (strips CR/LF, no header injection)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 200 }))
    );
    const res = await onRequestPost({
      request: formRequest({ ...valid, return: '/blog/x/\r\nSet-Cookie: evil=1' }),
      env: ENV,
    });
    expect(res.status).toBe(303);
    const loc = res.headers.get('location');
    expect(loc).not.toMatch(/[\r\n]/);
    expect(loc.startsWith('/blog/')).toBe(true);
  });

  it('commits a pending comment to the holding branch and emails both links', async () => {
    const calls = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, opts) => {
        calls.push({ url: String(url), method: opts?.method || 'GET', body: opts?.body });
        return new Response('{}', { status: 200 }); // ref check "exists", puts ok
      })
    );
    const res = await onRequestPost({ request: formRequest(valid, { json: true }), env: ENV });
    expect(res.status).toBe(200);
    expect((await res.json()).pending).toBe(true);

    const put = calls.find((c) => c.method === 'PUT' && c.url.includes('/contents/'));
    expect(put.url).toContain('/contents/src/_data/comments/introducing-silavapi/');
    expect(JSON.parse(put.body).branch).toBe('comments-pending');

    const mail = calls.find((c) => c.url.includes('resend.com'));
    expect(mail.body).toContain('/api/moderate?action=approve&slug=introducing-silavapi');
    expect(mail.body).toContain('/api/moderate?action=reject&slug=introducing-silavapi');
  });
});

function moderateGetReq(qs) {
  return new Request(`https://x/api/moderate?${qs}`);
}
function moderatePostReq(fields) {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.set(k, v);
  return new Request('https://x/api/moderate', { method: 'POST', body });
}
function readFile() {
  const content = btoa(JSON.stringify({ id: 'abc123', approved: false }));
  return new Response(JSON.stringify({ sha: 'sha1', content }), { status: 200 });
}

describe('GET /api/moderate (confirmation only, no side effect)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('rejects a tampered signature', async () => {
    const req = moderateGetReq(`action=approve&slug=post&id=abc123&ts=${FRESH_TS}&sig=deadbeef`);
    expect((await moderateGet({ request: req, env: ENV })).status).toBe(403);
  });

  it('rejects a missing, zero or malformed timestamp as a bad request (400)', async () => {
    const sig = await signFor('approve', 'post', 'abc123');
    for (const ts of ['', '0', '00']) {
      const q = `action=approve&slug=post&id=abc123${ts ? `&ts=${ts}` : ''}&sig=${sig}`;
      expect((await moderateGet({ request: moderateGetReq(q), env: ENV })).status).toBe(400);
    }
  });

  it('rejects an expired link (410)', async () => {
    const oldTs = FRESH_TS - APPROVAL_TTL_MS - 1000;
    const sig = await signFor('approve', 'post', 'abc123', oldTs);
    const req = moderateGetReq(`action=approve&slug=post&id=abc123&ts=${oldTs}&sig=${sig}`);
    expect((await moderateGet({ request: req, env: ENV })).status).toBe(410);
  });

  it('rejects an unknown action', async () => {
    const s = await signApproval(ENV.COMMENT_SECRET, 'delete:post:abc123');
    const req = moderateGetReq(`action=delete&slug=post&id=abc123&sig=${s}`);
    expect((await moderateGet({ request: req, env: ENV })).status).toBe(400);
  });

  it('shows a confirm page and never mutates on GET (prevents link-prefetch)', async () => {
    const sig = await signFor('approve', 'post', 'abc123');
    const seen = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, opts) => {
        seen.push({ method: opts?.method || 'GET' });
        return readFile();
      })
    );
    const res = await moderateGet({
      request: moderateGetReq(`action=approve&slug=post&id=abc123&ts=${FRESH_TS}&sig=${sig}`),
      env: ENV,
    });
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain('Approve this comment?');
    expect(body).toContain('<form method="post"');
    expect(seen.every((c) => c.method === 'GET')).toBe(true); // no PUT/DELETE
  });
});

describe('POST /api/moderate (performs the action)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('approve: publishes to main (approved:true) and deletes from the queue', async () => {
    const sig = await signFor('approve', 'post', 'abc123');
    const seen = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, opts) => {
        const method = opts?.method || 'GET';
        seen.push({ method, body: opts?.body });
        return method === 'GET' ? readFile() : new Response('{}', { status: 200 });
      })
    );
    const res = await moderatePost({
      request: moderatePostReq({
        action: 'approve',
        slug: 'post',
        id: 'abc123',
        ts: String(FRESH_TS),
        sig,
      }),
      env: ENV,
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('approved');

    const put = seen.find((c) => c.method === 'PUT');
    expect(JSON.parse(put.body).branch).toBe('main');
    const written = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(JSON.parse(put.body).content), (c) => c.charCodeAt(0))
      )
    );
    expect(written.approved).toBe(true);
    expect(JSON.parse(seen.find((c) => c.method === 'DELETE').body).branch).toBe(
      'comments-pending'
    );
  });

  it('reject: deletes from the queue, never touches main', async () => {
    const sig = await signFor('reject', 'post', 'abc123');
    const seen = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, opts) => {
        const method = opts?.method || 'GET';
        seen.push({ method, body: opts?.body });
        return method === 'GET' ? readFile() : new Response('{}', { status: 200 });
      })
    );
    const res = await moderatePost({
      request: moderatePostReq({
        action: 'reject',
        slug: 'post',
        id: 'abc123',
        ts: String(FRESH_TS),
        sig,
      }),
      env: ENV,
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('rejected');
    expect(seen.some((c) => c.method === 'PUT')).toBe(false);
    expect(JSON.parse(seen.find((c) => c.method === 'DELETE').body).branch).toBe(
      'comments-pending'
    );
  });

  it('rejects a tampered signature on POST too', async () => {
    const res = await moderatePost({
      request: moderatePostReq({
        action: 'approve',
        slug: 'post',
        id: 'abc123',
        ts: String(FRESH_TS),
        sig: 'nope',
      }),
      env: ENV,
    });
    expect(res.status).toBe(403);
  });
});
