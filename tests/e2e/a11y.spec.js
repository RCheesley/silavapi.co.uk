import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES } from './_pages.js';

// Axe scan of every page against WCAG 2.0/2.1/2.2 A + AA, plus best practice.
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
