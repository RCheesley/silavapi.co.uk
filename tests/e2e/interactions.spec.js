import { test, expect } from '@playwright/test';

test.describe('blog filter (progressive enhancement)', () => {
  test('category chip filters cards, updates count + aria-pressed', async ({ page }) => {
    await page.goto('/blog/');
    const cards = page.locator('.article-card');
    const total = await cards.count();
    expect(total).toBeGreaterThan(0);

    await page.locator('.chip[data-category="Buddhism"]').click();
    await expect(page.locator('.chip[aria-pressed="true"]')).toHaveText('Buddhism');
    // At least one card remains, and every visible card is in the category.
    const visible = page.locator('.article-card:visible');
    expect(await visible.count()).toBeGreaterThan(0);
    const cats = await visible.evaluateAll((els) =>
      els.map((el) => el.getAttribute('data-category'))
    );
    expect(cats.every((c) => c === 'Buddhism')).toBe(true);
    await expect(page.locator('[data-blog-count]')).toContainText('in Buddhism');
  });

  // Full-text blog search moved from an inline card filter to the Pagefind-backed
  // dialog (data-search-open="blog"); it is covered in search.spec.js.
});

test.describe('article reader text-size', () => {
  test('changing size updates aria-pressed and enlarges the body', async ({ page }) => {
    await page.goto('/blog/introducing-silavapi/');
    const body = page.locator('.article__body');
    const before = await body.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

    await page.locator('.text-size__btn[data-reader-size="1.25"]').click();
    await expect(page.locator('.text-size__btn[aria-pressed="true"]')).toHaveAttribute(
      'data-reader-size',
      '1.25'
    );
    const after = await body.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(after).toBeGreaterThan(before);
  });
});

test.describe('contact form (progressive enhancement)', () => {
  test('empty submit shows warm errors and marks fields invalid', async ({ page }) => {
    await page.goto('/contact/');
    await page.locator('.contact__form button[type="submit"]').click();
    await expect(page.locator('#c-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#c-name-error')).toBeVisible();
    await expect(page.locator('#c-name-error')).toContainText('name');
  });

  test('valid submit announces success', async ({ page }) => {
    // The real delivery endpoint is a Cloudflare Pages Function, absent from the
    // static test server. Mock it so this exercises the client success path
    // (the function's own logic is covered by the unit tests).
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      })
    );
    await page.goto('/contact/');
    await page.locator('#c-name').fill('Test Person');
    await page.locator('#c-email').fill('test@example.com');
    await page.locator('#c-msg').fill('Hello there.');
    await page.locator('.contact__form button[type="submit"]').click();
    const status = page.locator('[data-contact-status] .alert--success');
    await expect(status).toBeVisible();
    await expect(status).toHaveAttribute('role', 'status');
  });
});
