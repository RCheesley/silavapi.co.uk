/**
 * parse-sql.mjs - a small, dependency-free parser for phpMyAdmin MySQL dumps.
 * Handles single-quoted strings with backslash escapes and doubled-quote
 * escapes, multiple extended-INSERT statements, and NULL. Returns rows keyed by
 * the column names from the table's CREATE TABLE statement.
 *
 * Migration-only tooling; not part of the site build.
 */

/** Column names, in order, from `CREATE TABLE \`name\` ( ... )`. */
export function parseColumns(sql, table) {
  const re = new RegExp('CREATE TABLE `' + table + '` \\(([\\s\\S]*?)\\n\\)', 'm');
  const m = re.exec(sql);
  if (!m) throw new Error(`CREATE TABLE ${table} not found`);
  const cols = [];
  for (const line of m[1].split('\n')) {
    const cm = /^\s*`([a-zA-Z0-9_]+)`\s/.exec(line);
    if (cm) cols.push(cm[1]);
  }
  return cols;
}

const ESC = {
  n: '\n',
  r: '\r',
  t: '\t',
  0: '\0',
  b: '\b',
  Z: '\x1a',
  "'": "'",
  '"': '"',
  '\\': '\\',
};

/** Parse the tuple list after a VALUES keyword into arrays of values. */
function parseTuples(sql, start) {
  let i = start;
  const n = sql.length;
  const rows = [];
  const ws = () => {
    while (i < n && /\s/.test(sql[i])) i++;
  };
  while (i < n) {
    ws();
    if (sql[i] === ';') {
      i++;
      break;
    }
    if (sql[i] === ',') {
      i++;
      continue;
    }
    if (sql[i] !== '(') break;
    i++; // (
    const row = [];
    while (i < n) {
      ws();
      if (sql[i] === "'") {
        i++;
        let s = '';
        while (i < n) {
          const c = sql[i];
          if (c === '\\') {
            const nx = sql[i + 1];
            s += nx in ESC ? ESC[nx] : nx;
            i += 2;
          } else if (c === "'") {
            if (sql[i + 1] === "'") {
              s += "'";
              i += 2;
            } else {
              i++;
              break;
            }
          } else {
            s += c;
            i++;
          }
        }
        row.push(s);
      } else {
        let s = '';
        while (i < n && sql[i] !== ',' && sql[i] !== ')') {
          s += sql[i];
          i++;
        }
        s = s.trim();
        row.push(s === 'NULL' ? null : s);
      }
      ws();
      if (sql[i] === ',') {
        i++;
        continue;
      }
      if (sql[i] === ')') {
        i++;
        break;
      }
    }
    rows.push(row);
  }
  return { rows, next: i };
}

/** Return all rows (as {col: value}) for INSERTs into `table`. */
export function parseInserts(sql, table) {
  const cols = parseColumns(sql, table);
  const rows = [];
  const insertRe = new RegExp('INSERT INTO `' + table + '`[^;]*?VALUES', 'g');
  while (insertRe.exec(sql) !== null) {
    const { rows: tuples, next } = parseTuples(sql, insertRe.lastIndex);
    for (const t of tuples) {
      const obj = {};
      cols.forEach((c, idx) => {
        obj[c] = t[idx];
      });
      rows.push(obj);
    }
    insertRe.lastIndex = next;
  }
  return { columns: cols, rows };
}
