import { test, expect } from '@playwright/test';

test.describe('blog filter (progressive enhancement)', () => {
  test('category chip filters cards, updates count + aria-pressed', async ({ page }) => {
    await page.goto('/blog/');
    const cards = page.locator('.article-card');
    const total = await cards.count();
    expect(total).toBeGreaterThan(0);

    await page.locator('.chip[data-category="Buddhism"]').click();
    await expect(page.locator('.chip[aria-pressed="true"]')).toHaveText('Buddhism');
    // Only Buddhism-category cards remain visible.
    const visible = page.locator('.article-card:visible');
    await expect(visible).toHaveCount(1);
    await expect(page.locator('[data-blog-count]')).toContainText('in Buddhism');
  });

  test('search filters cards and shows the empty state when nothing matches', async ({ page }) => {
    await page.goto('/blog/');
    await page.locator('[data-blog-search]').fill('zzzzzzz-no-match');
    await expect(page.locator('.article-card:visible')).toHaveCount(0);
    await expect(page.locator('[data-blog-empty]')).toBeVisible();
    await expect(page.locator('[data-blog-count]')).toContainText('0 posts');
  });
});

test.describe('article reader text-size', () => {
  test('changing size updates aria-pressed and enlarges the body', async ({ page }) => {
    await page.goto('/blog/a-new-name-becoming-silavapi/');
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
