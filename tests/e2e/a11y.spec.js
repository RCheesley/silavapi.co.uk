import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES } from './_pages.js';

// Axe scan of every page against WCAG 2.0/2.1 A + AA and WCAG 2.2 AA, plus
// best practice. (axe-core exposes no `wcag22a` tag - the 2.2 additions it
// automates are AA-level, tagged `wcag22aa`; 2.2 A-level criteria such as
// 3.3.7 Redundant Entry have no automated rule and are checked manually.)
test.describe('accessibility (axe-core)', () => {
  for (const p of PAGES) {
    test(`${p.name} has no axe violations`, async ({ page }) => {
      await page.goto(p.path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();

      // Surface any violations in the failure message for quick triage.
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }
});
