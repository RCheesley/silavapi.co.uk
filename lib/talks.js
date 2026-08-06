/**
 * talks.js - pure helpers behind the Speaking section's Eleventy filters and
 * collections. Kept here (not inline in eleventy.config.js) so they can be unit
 * tested. Each takes plain data shapes and returns new arrays (no mutation).
 */

/** Posts whose `data.category` is in `cats`. */
export function byCategories(posts, cats) {
  const set = new Set(cats || []);
  return (posts || []).filter((p) => set.has(p.data.category));
}

/** Posts sharing at least one (case-insensitive) tag with `tags`, order kept. */
export function byTags(posts, tags) {
  const want = new Set((tags || []).map((t) => String(t).toLowerCase()));
  if (!want.size) return [];
  return (posts || []).filter((p) =>
    (p.data.tags || []).some((t) => want.has(String(t).toLowerCase()))
  );
}

/** Group dated items by calendar year, newest year first: [{ year, items }]. */
export function groupByYear(items) {
  const groups = new Map();
  for (const it of items || []) {
    const y = it.date.getFullYear();
    if (!groups.has(y)) groups.set(y, []);
    groups.get(y).push(it);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items }));
}

/**
 * Flatten talks into one "presentation" row per event. A talk with an
 * `events[]` array yields a row per event; a talk without falls back to its
 * own top-level fields. Each row carries the fields the archive/map/cards need.
 */
export function presentationsOf(talks) {
  const rows = [];
  for (const t of talks || []) {
    const events =
      t.data.events && t.data.events.length
        ? t.data.events
        : [{ event: t.data.event, date: t.data.date, location: t.data.location }];
    for (const e of events) {
      rows.push({
        talk: t,
        url: t.url,
        title: t.data.title,
        event: e.event,
        date: e.date ? new Date(e.date) : t.date,
        location: e.location || null,
        cover: t.data.cover,
        slides: t.data.slides,
        video: t.data.video,
      });
    }
  }
  return rows;
}

/** Unique lower-cased ISO alpha-2 country codes across presentation rows. */
export function presentationCountries(presentations) {
  const seen = new Set();
  for (const p of presentations || []) {
    const iso = p.location && p.location.country;
    if (iso) seen.add(String(iso).toLowerCase());
  }
  return [...seen];
}
