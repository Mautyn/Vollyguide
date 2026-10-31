import { expect, test } from '@playwright/test';

test('a deep link loads the court page', async ({ page }) => {
  await page.goto('court');
  // Six players on court plus the middle blocker the libero replaced (libero on by default).
  await expect(page.getByTestId('player')).toHaveCount(7);
});

test('the build ships a 404.html that boots the app', async ({ page, request }) => {
  const response = await request.get('404.html');
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain('<div id="root"></div>');
  expect(html).toContain('/Vollyguide/assets/');

  await page.goto('404.html');
  // Not a known route, so the app itself renders its not-found page.
  await expect(page.getByText('Page not found.')).toBeVisible();
});
