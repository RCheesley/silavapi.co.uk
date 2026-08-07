/**
 * related.js - choose "related posts" for a blog post. Scores every other post
 * by shared taxonomy (same category is weighted; each shared tag adds a point),
 * orders related-first, and tops up to `limit` with the most recent so the
 * section is never sparse. Pure and testable.
 *
 * Category is the primary signal because nearly every post has one, while only
 * some carry tags; tags refine the ranking where they exist.
 */
export function relatedPosts(posts, currentUrl, category, tags, limit = 3) {
  const wantTags = new Set((tags || []).map((t) => String(t).toLowerCase()));
  const cat = String(category || '').toLowerCase();

  const score = (post) => {
    const data = post.data || {};
    let s = cat && String(data.category || '').toLowerCase() === cat ? 2 : 0;
    for (const t of data.tags || []) if (wantTags.has(String(t).toLowerCase())) s += 1;
    return s;
  };

  return (
    (posts || [])
      .filter((p) => p && p.url !== currentUrl)
      .map((p, i) => ({ p, s: score(p), i }))
      // Highest score first; ties keep the incoming order (newest-first collection).
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .slice(0, Math.max(0, limit))
      .map((x) => x.p)
  );
}
