import { expect, test } from '@playwright/test';

test('the court page fits a 375 px phone screen without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('court');
  await expect(page.getByTestId('player')).toHaveCount(6);
  await expect(page.getByTestId('court-stage').locator('canvas').first()).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  const canvasBox = await page.getByTestId('court-stage').locator('canvas').first().boundingBox();
  expect(canvasBox!.x).toBeGreaterThanOrEqual(0);
  expect(canvasBox!.x + canvasBox!.width).toBeLessThanOrEqual(375);
});

test('follows the system dark colour scheme', async ({ page }) => {
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('./');
  const light = await background();

  await page.emulateMedia({ colorScheme: 'dark' });
  const dark = await background();

  expect(dark).not.toBe(light);
});

test('loads nothing from third-party hosts', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const foreign: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && url.origin !== origin) foreign.push(request.url());
  });

  await page.goto('./');
  await page.getByRole('link', { name: 'Open the court' }).click();
  await expect(page.getByTestId('player')).toHaveCount(6);
  await page.waitForLoadState('networkidle');

  expect(foreign).toEqual([]);
});
