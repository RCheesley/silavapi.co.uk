/**
 * _github.js - minimal GitHub Contents/Git API helpers for the comment
 * Functions. Not a route (leading underscore). Pending comments are committed to
 * a holding branch (so main - and production builds - only ever see approved
 * comments); approving moves the file to main, rejecting deletes it. Needs env:
 * GITHUB_TOKEN, GITHUB_REPO ("owner/name"), optional GITHUB_BRANCH (default
 * "main"). Each call takes an explicit `branch` so callers pick main vs pending.
 */
const API = 'https://api.github.com';

function headers(env) {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'silavapi-comments',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function branchOf(env, branch) {
  return branch || env.GITHUB_BRANCH || 'main';
}

// UTF-8 safe base64 (Workers has btoa/atob but only over Latin-1).
function toBase64(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}
function fromBase64(b64) {
  const bytes = Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Read a JSON file from `branch`. Returns { sha, content } or null if absent. */
export async function getFile(env, path, branch) {
  const ref = encodeURIComponent(branchOf(env, branch));
  const url = `${API}/repos/${env.GITHUB_REPO}/contents/${path}?ref=${ref}`;
  const res = await fetch(url, { headers: headers(env) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${res.status}`);
  const json = await res.json();
  return { sha: json.sha, content: JSON.parse(fromBase64(json.content)) };
}

/** Create or update a JSON file on `branch` (pass `sha` to update). */
export async function putFile(env, path, dataObj, message, sha, branch) {
  const body = {
    message,
    content: toBase64(JSON.stringify(dataObj, null, 2) + '\n'),
    branch: branchOf(env, branch),
  };
  if (sha) body.sha = sha;
  const res = await fetch(`${API}/repos/${env.GITHUB_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { ...headers(env), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${res.status}`);
  return res.json();
}

/** Delete a file from `branch` (requires its current `sha`). */
export async function deleteFile(env, path, sha, message, branch) {
  const res = await fetch(`${API}/repos/${env.GITHUB_REPO}/contents/${path}`, {
    method: 'DELETE',
    headers: { ...headers(env), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha, branch: branchOf(env, branch) }),
  });
  if (!res.ok) throw new Error(`GitHub DELETE ${res.status}`);
  return res.json();
}

/** Ensure `branch` exists, creating it from `fromBranch` (default main) if not. */
export async function ensureBranch(env, branch, fromBranch) {
  const git = `${API}/repos/${env.GITHUB_REPO}/git`;
  const exists = await fetch(`${git}/ref/heads/${encodeURIComponent(branch)}`, {
    headers: headers(env),
  });
  if (exists.ok) return;
  if (exists.status !== 404) throw new Error(`GitHub ref check ${exists.status}`);
  const base = await fetch(`${git}/ref/heads/${encodeURIComponent(branchOf(env, fromBranch))}`, {
    headers: headers(env),
  });
  if (!base.ok) throw new Error(`GitHub base ref ${base.status}`);
  const sha = (await base.json()).object.sha;
  const created = await fetch(`${git}/refs`, {
    method: 'POST',
    headers: { ...headers(env), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }),
  });
  // 422 = the ref already exists (a concurrent create won the race) - fine.
  if (!created.ok && created.status !== 422) throw new Error(`GitHub create ref ${created.status}`);
}
