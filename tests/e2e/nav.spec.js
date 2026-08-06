import { test, expect } from '@playwright/test';

// The primary nav: an inline row on desktop, a JS-collapsible menu on narrow
// screens, and a fully-visible stacked list without JS.
test.describe('primary navigation', () => {
  test('desktop shows the inline nav and hides the menu button', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.goto('/');
    await expect(page.locator('.site-nav__toggle')).toBeHidden();
    // All items visible inline.
    await expect(page.locator('.site-nav__panel')).toBeVisible();
    await expect(page.locator('.site-nav__link', { hasText: 'Speaking' })).toBeVisible();
  });

  test('narrow screens collapse behind a menu button that toggles the panel', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    const btn = page.locator('.site-nav__toggle');
    const panel = page.locator('.site-nav__panel');
    await expect(btn).toBeVisible();
    await expect(panel).toBeHidden();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');

    await btn.click();
    await expect(panel).toBeVisible();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.site-nav__link', { hasText: 'Contact' })).toBeVisible();

    // Escape closes it and returns focus to the button.
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(btn).toBeFocused();
  });

  test('without JS the full nav is shown and the button is hidden', async ({ browser }) => {
    const ctx = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 375, height: 800 },
    });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('.site-nav__toggle')).toBeHidden();
    await expect(page.locator('.site-nav__panel')).toBeVisible();
    await expect(page.locator('.site-nav__link', { hasText: 'Contact' })).toBeVisible();
    await ctx.close();
  });
});
