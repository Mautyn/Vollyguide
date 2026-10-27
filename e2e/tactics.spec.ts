import { expect, test } from '@playwright/test';

test('plays the double block, pauses and steps between moments', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('navigation').getByRole('link', { name: 'Tactics' }).click();
  await expect(page).toHaveURL(/\/tactics\/blocking\/double-block-vs-outside$/);
  await expect(
    page.getByRole('heading', { name: 'Double block vs. an outside attack' }),
  ).toBeVisible();

  // It plays on its own and ends on the block.
  const counter = page.getByTestId('moment-counter');
  await expect(counter).toHaveText('Moment 2 of 4');
  await expect(counter).toHaveText('Moment 4 of 4', { timeout: 6000 });
  await expect(page.getByTestId('scene-caption')).toContainText('Stuff block');
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();

  // Restart and Pause: playback stops.
  await page.getByRole('button', { name: 'Restart' }).click();
  await expect(counter).toHaveText('Moment 1 of 4');
  await page.waitForTimeout(1500);
  await expect(counter).toHaveText('Moment 1 of 4');

  await page.getByRole('button', { name: 'Play' }).click();
  await expect(counter).toHaveText('Moment 2 of 4');
  await page.getByRole('button', { name: 'Pause' }).click();
  const paused = await counter.textContent();
  await page.waitForTimeout(1500);
  await expect(counter).toHaveText(paused!);

  // Step between moments; the block bars appear at the block moment.
  await page.getByRole('button', { name: 'Restart' }).click();
  await page.getByRole('button', { name: 'Next moment' }).click();
  await page.getByRole('button', { name: 'Next moment' }).click();
  await expect(counter).toHaveText('Moment 3 of 4');
  await expect(page.getByTestId('scene-caption')).toContainText('Joint jump');
  const blockBars = await page.evaluate(() => {
    const konva = (window as unknown as { Konva?: { stages: { find(s: string): unknown[] }[] } })
      .Konva;
    return konva?.stages[0]?.find('.block-bar').length;
  });
  expect(blockBars).toBe(2);
  await page.getByRole('button', { name: 'Previous moment' }).click();
  await expect(counter).toHaveText('Moment 2 of 4');
});

test('a shared link opens that situation', async ({ page }) => {
  await page.goto('tactics/blocking/triple-block-vs-high-ball');
  await expect(
    page.getByRole('heading', { name: 'Triple block vs. a high outside ball' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Triple block vs. a high outside ball' }),
  ).toHaveAttribute('aria-current', 'page');
});

test('the Tactics page fits a 375 px phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('tactics');
  await expect(page.getByTestId('moment-counter')).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Tactics' })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
