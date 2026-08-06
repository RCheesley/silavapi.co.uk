import { test, expect } from '@playwright/test';

// The colour-theme control is progressive enhancement: hidden without JS, and
// with no saved choice the site follows prefers-color-scheme (covered by the
// dark-scheme a11y project). These tests exercise the JS-driven behaviour.
test.describe('colour-theme toggle', () => {
  test('is revealed by JS and reflects the active choice', async ({ page }) => {
    await page.goto('/');
    const group = page.locator('.theme-toggle');
    await expect(group).toBeVisible();
    // System is the default when nothing is saved.
    await expect(page.locator('.theme-toggle__btn[data-theme-choice="system"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    // No forced theme yet.
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
  });

  test('forcing dark sets data-theme and persists across navigation', async ({ page }) => {
    await page.goto('/');
    await page.locator('.theme-toggle__btn[data-theme-choice="dark"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.theme-toggle__btn[data-theme-choice="dark"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    // Persists (applied pre-paint on the next page).
    await page.goto('/speaking/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Switching to System clears the forced attribute again.
    await page.locator('.theme-toggle__btn[data-theme-choice="system"]').click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
  });

  test('forcing light pins the theme even under a dark OS preference', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto('/');
    await page.locator('.theme-toggle__btn[data-theme-choice="light"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    // The page surface is the light surface, not the dark one.
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--surface-page').trim()
    );
    expect(bg.toLowerCase()).not.toBe('#161122');
    await ctx.close();
  });
});
