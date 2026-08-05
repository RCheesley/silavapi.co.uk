import { test, expect } from '@playwright/test';
import { PAGES } from './_pages.js';

const SAME_ORIGIN = `http://localhost:${Number(process.env.PORT ?? 8080)}`;

test.describe('privacy guarantees', () => {
  for (const p of PAGES) {
    test(`${p.name} makes no third-party requests and sets no cookies`, async ({ page }) => {
      const offOrigin = [];
      page.on('request', (req) => {
        const url = req.url();
        if (!url.startsWith(SAME_ORIGIN) && !url.startsWith('data:')) {
          offOrigin.push(url);
        }
      });

      await page.goto(p.path, { waitUntil: 'networkidle' });

      // Zero third-party requests.
      expect(offOrigin, `off-origin requests: ${offOrigin.join(', ')}`).toEqual([]);

      // No cookies set at all.
      expect(await page.context().cookies()).toEqual([]);
      expect(await page.evaluate(() => document.cookie)).toBe('');

      // No external-host resource references loaded into the DOM. Deliberate
      // outbound links (social/old site) are allowed as `href`s in the
      // footer/prose, but nothing may be *loaded* from off-origin (any `src`).
      const loadedExternally = await page.evaluate(() =>
        [...document.querySelectorAll('[src]')]
          .map((el) => el.getAttribute('src') || '')
          .filter((v) => /^https?:\/\//i.test(v) && !v.startsWith(location.origin))
      );
      expect(
        loadedExternally,
        `externally loaded sub-resources: ${loadedExternally.join(', ')}`
      ).toEqual([]);
    });
  }
});
