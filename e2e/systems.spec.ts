import { expect, test } from '@playwright/test';

test('6-2 rotation 4 base: S2 is the back-row setter in zone 1', async ({ page }) => {
  await page.goto('court');
  await page.getByRole('radio', { name: '6-2' }).click();
  await page.getByRole('radio', { name: 'Rotation 4' }).click();

  const players = page.getByTestId('player');
  await expect(players.filter({ hasText: 'S2' })).toHaveText(
    'S2 Setter 7.5 m from left · 6.0 m from net',
  );
  await expect(players.filter({ hasText: 'Opposite' })).toHaveCount(0);
  await expect(page.getByTestId('system-hint')).toContainText('back row sets');
});

test('4-2 rotation 1 receive: legal, with S2 at the net near zone 3', async ({ page }) => {
  await page.goto('court');
  await page.getByRole('radio', { name: '4-2' }).click();
  await page.getByRole('radio', { name: 'Receive' }).click();

  await expect(page.getByRole('status')).toHaveText(/legal/);
  await expect(page.getByTestId('player').filter({ hasText: 'S2' })).toHaveText(
    'S2 Setter 3.6 m from left · 0.4 m from net',
  );
  await expect(page.getByTestId('formation-note')).toContainText('zone 3');
});

test('practice a 4-2 task: Show answer then Check scores 6 of 6', async ({ page }) => {
  await page.goto('practice');
  await page.getByRole('radio', { name: '4-2' }).click();
  await page.getByRole('radio', { name: 'Receive' }).click();
  await expect(page.getByTestId('practice-task')).toHaveText('4-2, rotation 1, receive');

  await page.getByRole('button', { name: 'Show answer' }).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('practice-result')).toHaveText('6 of 6 correct, lineup legal');
});
