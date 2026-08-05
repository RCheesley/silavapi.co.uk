import { test, expect } from '@playwright/test';
import { PAGES } from './_pages.js';

test.describe('page structure & landmarks', () => {
  for (const p of PAGES) {
    test(`${p.name} has one h1, landmarks, and a working skip link`, async ({ page }) => {
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);

      // Exactly one h1, matching the page.
      const h1s = page.locator('h1');
      await expect(h1s).toHaveCount(1);
      await expect(h1s.first()).toHaveText(p.h1);

      // Semantic landmarks present.
      await expect(page.locator('header.site-header')).toBeVisible();
      await expect(page.locator('nav[aria-label="Main"]')).toHaveCount(1);
      await expect(page.locator('main#main')).toHaveCount(1);
      await expect(page.locator('footer.site-footer')).toHaveCount(1);

      // Skip link is the first focusable element and targets #main.
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toHaveText('Skip to main content');
      await expect(focused).toHaveAttribute('href', '#main');
    });
  }
});

test('home marks the Home nav item current; privacy marks none', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav[aria-label="Main"] a[aria-current="page"]')).toHaveText('Home');

  await page.goto('/privacy/');
  await expect(page.locator('nav[aria-label="Main"] a[aria-current="page"]')).toHaveCount(0);
});

test('footer carries the privacy pledge and no phone number', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer.site-footer');
  await expect(footer).toContainText('sets no cookies');
  await expect(footer).toContainText('built in the open with free software');
  // Deliberate removal: no telephone anywhere in the footer.
  await expect(footer).not.toContainText(/tel:/i);
});

test('the document language is British English', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
});

test('gradient bands carry a solid background-color fallback', async ({ page }) => {
  // Contrast tooling (and old browsers) cannot read gradient backgrounds, so
  // any element painted with a gradient must also declare a solid, opaque
  // background-color that matches the tone. This guards the whole convention.
  await page.goto('/');
  const bad = await page.evaluate(() => {
    const offenders = [];
    for (const el of document.querySelectorAll('*')) {
      // Only text-bearing elements need an evaluable contrast background;
      // purely decorative gradient shapes (e.g. the <hr> rule) are exempt.
      if (el.textContent.trim() === '') continue;
      const cs = getComputedStyle(el);
      if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) {
        const bg = cs.backgroundColor;
        const transparent = bg === 'transparent' || /rgba?\([^)]*,\s*0\s*\)$/.test(bg);
        if (transparent) offenders.push(el.className || el.tagName);
      }
    }
    return offenders;
  });
  expect(bad, `gradient elements missing a solid fallback: ${bad.join(', ')}`).toEqual([]);
});
