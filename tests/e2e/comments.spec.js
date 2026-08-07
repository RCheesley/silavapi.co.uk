import { test, expect } from '@playwright/test';

const POST = '/blog/introducing-silavapi/';

test.describe('blog comments', () => {
  test('shows the comment form and the empty state', async ({ page }) => {
    await page.goto(POST);
    await expect(page.locator('[data-comment-form]')).toBeVisible();
    await expect(page.locator('.comments__empty')).toBeVisible();
  });

  test('inline-validates an empty submit', async ({ page }) => {
    await page.goto(POST);
    await page.locator('[data-comment-form] [type="submit"]').click();
    await expect(page.locator('#cm-name-error')).toContainText('name');
    await expect(page.locator('#cm-comment-error')).not.toBeEmpty();
    // Nothing was sent (native submit prevented).
    await expect(page).toHaveURL(POST);
  });

  test('valid submit announces moderation (endpoint mocked)', async ({ page }) => {
    await page.route('**/api/comment', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, pending: true }),
      })
    );
    await page.goto(POST);
    await page.locator('#cm-name').fill('Ada Lovelace');
    await page.locator('#cm-comment').fill('A thoughtful comment.');
    await page.locator('[data-comment-form] [type="submit"]').click();
    await expect(page.locator('[data-comment-status]')).toContainText('moderation');
  });

  test('without JS the form still posts natively to /api/comment', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(POST);
    await expect(page.locator('[data-comment-form]')).toHaveAttribute('action', '/api/comment');
    // Reply buttons are a JS enhancement; hidden/absent without JS.
    await expect(page.locator('.comment__reply:visible')).toHaveCount(0);
    await ctx.close();
  });
});
