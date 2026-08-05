#!/usr/bin/env node
/**
 * clean.mjs - remove build + search output. Portable across shells (no rm -rf),
 * since the project targets Node with cross-platform tooling.
 */
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGETS = ['_site', '.cache', 'pagefind'];

await Promise.all(TARGETS.map((t) => rm(resolve(ROOT, t), { recursive: true, force: true })));
console.log(`Cleaned: ${TARGETS.join(', ')}`);
