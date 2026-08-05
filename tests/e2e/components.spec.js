import { test, expect } from '@playwright/test';

// Renders every design-system component; asserts each macro produced the right
// structure. Accessibility of this page is covered by a11y.spec.js in both
// colour schemes; this spec checks the components render as intended.
test.beforeEach(async ({ page }) => {
  await page.goto('/dev/components/');
});

test('buttons render all three variants', async ({ page }) => {
  await expect(page.locator('.btn--primary').first()).toBeVisible();
  await expect(page.locator('.btn--secondary')).toHaveCount(1);
  await expect(page.locator('.btn--ghost')).toHaveCount(1);
  // The submit button is a real <button type="submit">, not a link.
  await expect(page.locator('button.btn[type="submit"]')).toHaveCount(1);
});

test('category badges render each tone', async ({ page }) => {
  // Each tone appears at least once (badges also sit inside article cards).
  for (const tone of ['brand', 'accent', 'warm', 'neutral']) {
    expect(await page.locator(`.badge--${tone}`).count()).toBeGreaterThan(0);
  }
});

test('topic cards inline an SVG icon in a gradient plate', async ({ page }) => {
  const cards = page.locator('.topic-card');
  await expect(cards).toHaveCount(4);
  await expect(cards.first().locator('.topic-card__icon svg.icon')).toBeVisible();
  // The "&" entity is decoded (no literal &amp;).
  await expect(cards.first()).toContainText('Community & open source');
});

test('article cards have image, badge, linked title and excerpt', async ({ page }) => {
  const cards = page.locator('.article-card');
  await expect(cards).toHaveCount(3);
  const first = cards.first();
  await expect(first.locator('.article-card__media img')).toBeVisible();
  await expect(first.locator('.badge')).toBeVisible();
  await expect(first.locator('.article-card__title a')).toHaveAttribute('href', /.+/);
  await expect(first.locator('.article-card__excerpt')).toBeVisible();
});

test('category chips expose aria-pressed', async ({ page }) => {
  await expect(page.locator('.chip[aria-pressed="true"]')).toHaveCount(1);
  await expect(page.locator('.chip[aria-pressed="false"]').first()).toBeVisible();
});

test('alerts render info and success, success announced politely', async ({ page }) => {
  await expect(page.locator('.alert--info')).toHaveCount(1);
  const success = page.locator('.alert--success');
  await expect(success).toHaveCount(1);
  await expect(success).toHaveAttribute('role', 'status');
});

test('dark quote band renders a centred pull quote', async ({ page }) => {
  const q = page.locator('.quote--dark');
  await expect(q).toHaveCount(1);
  await expect(q.locator('blockquote')).toContainText('home for that drive to connect');
});
