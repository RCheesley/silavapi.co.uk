/** summarize.mjs - report the published-article scope from the Joomla dumps. */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseInserts } from './parse-sql.mjs';

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../migration');
const contentSql = readFileSync(resolve(DIR, 'h8u7t_content.sql'), 'utf8');
const catSql = readFileSync(resolve(DIR, 'h8u7t_categories.sql'), 'utf8');

const cats = new Map();
for (const c of parseInserts(catSql, 'h8u7t_categories').rows) {
  cats.set(c.id, c);
}
const catPath = (id) => {
  const c = cats.get(id);
  return c ? c.path : `?${id}`;
};

const { rows } = parseInserts(contentSql, 'h8u7t_content');
const STATE = { 1: 'published', 0: 'unpublished', '-2': 'trashed', 2: 'archived' };

const published = rows.filter((r) => r.state === '1');
console.log(`Total content rows: ${rows.length}`);
const byState = {};
for (const r of rows)
  byState[STATE[r.state] || r.state] = (byState[STATE[r.state] || r.state] || 0) + 1;
console.log('By state:', byState);

console.log(`\n=== PUBLISHED articles (${published.length}) ===`);
const byCat = {};
for (const r of published) {
  const path = catPath(r.catid);
  byCat[path] = (byCat[path] || 0) + 1;
}
console.log('\nPublished by category path:');
for (const [p, n] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${n.toString().padStart(3)}  ${p}`);
}

console.log('\nPublished articles (id | date | catPath | imgs | tweetme | title):');
for (const r of published.sort((a, b) =>
  (a.publish_up || a.created).localeCompare(b.publish_up || b.created)
)) {
  const body = (r.introtext || '') + (r.fulltext || '');
  const imgs = (body.match(/<img/g) || []).length;
  const tweet = /\{tweetme/.test(body) ? 'T' : ' ';
  const date = (r.publish_up || r.created || '').slice(0, 10);
  console.log(
    `  ${r.id.padStart(3)} | ${date} | ${catPath(r.catid).padEnd(28)} | ${String(imgs).padStart(2)} | ${tweet} | ${r.title}`
  );
}
