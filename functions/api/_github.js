/**
 * _github.js - minimal GitHub Contents API helpers for the comment Functions.
 * Not a route (leading underscore). Commits comment files to the repo so the
 * next Pages build renders them. Needs env: GITHUB_TOKEN, GITHUB_REPO
 * ("owner/name"), optional GITHUB_BRANCH (default "main").
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

// UTF-8 safe base64 (Workers has btoa/atob but only over Latin-1).
function toBase64(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}
function fromBase64(b64) {
  const bytes = Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Read a JSON file. Returns { sha, content } or null if it doesn't exist. */
export async function getFile(env, path) {
  const branch = env.GITHUB_BRANCH || 'main';
  const url = `${API}/repos/${env.GITHUB_REPO}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: headers(env) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${res.status}`);
  const json = await res.json();
  return { sha: json.sha, content: JSON.parse(fromBase64(json.content)) };
}

/** Create or update a JSON file (pass `sha` to update). */
export async function putFile(env, path, dataObj, message, sha) {
  const body = {
    message,
    content: toBase64(JSON.stringify(dataObj, null, 2) + '\n'),
    branch: env.GITHUB_BRANCH || 'main',
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
