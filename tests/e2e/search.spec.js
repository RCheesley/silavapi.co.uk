import { test, expect } from '@playwright/test';

// Site search: a header icon opens a dialog backed by the self-hosted Pagefind
// index; the blog has a trigger that scopes the same dialog to blog posts.
// These run against the built _site (npm run serve), where the index exists.
test.describe('site search', () => {
  test('header icon opens the dialog and returns results that navigate', async ({ page }) => {
    await page.goto('/');

    const opener = page.locator('[data-search-open]').first();
    await expect(opener).toBeVisible(); // revealed by search.js
    await opener.click();

    const dialog = page.locator('[data-search-dialog]');
    await expect(dialog).toBeVisible();
    await expect(page.locator('[data-search-input]')).toBeFocused();

    await page.locator('[data-search-input]').fill('mautic');
    const results = page.locator('.search-result');
    await expect(results.first()).toBeVisible();
    expect(await results.count()).toBeGreaterThan(0);

    // Following a result navigates to its page.
    await results.first().locator('a').click();
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL('/');
  });

  test('Escape closes the dialog', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-search-open]').first().click();
    const dialog = page.locator('[data-search-dialog]');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('blog trigger scopes results to the blog section', async ({ page }) => {
    await page.goto('/blog/');

    const blogOpener = page.locator('[data-search-open="blog"]');
    await expect(blogOpener).toBeVisible();
    await blogOpener.click();

    await page.locator('[data-search-input]').fill('mautic');
    const links = page.locator('.search-result__link');
    await expect(links.first()).toBeVisible();

    // Every result is a blog post (the section filter is honoured).
    const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toMatch(/^\/blog\//);
  });

  test('without JS the search controls stay hidden (no broken affordance)', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('.header-search')).toBeHidden();
    await ctx.close();
  });
});
