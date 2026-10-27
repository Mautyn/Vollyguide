import { expect, test } from '@playwright/test';

test('switching on the libero replaces the back-row middle blocker', async ({ page }) => {
  await page.goto('court');
  const toggle = page.getByRole('switch', { name: 'Use libero' });
  await expect(toggle).not.toBeChecked();

  await toggle.click();
  await expect(toggle).toBeChecked();

  // Rotation 1: MB1 is the back-row middle at (4.5, 3); L takes that spot, MB1 goes to the bench.
  const players = page.getByTestId('player');
  await expect(players.filter({ hasText: 'Libero' })).toHaveText('L Libero x 4.5 m, y 3.0 m');
  await expect(players.filter({ hasText: 'MB1' })).toHaveText(
    'MB1 Middle blocker Bench x -1.5 m, y 3.0 m',
  );
  await expect(page.getByRole('status')).toHaveText(/legal/);

  // Rotation 4: the other middle (MB2) is in the back row now.
  await page.getByRole('radio', { name: 'Rotation 4' }).click();
  await expect(players.filter({ hasText: 'Bench' })).toContainText('MB2');
});

test('the libero setting survives a page reload', async ({ page }) => {
  await page.goto('court');
  await page.getByRole('switch', { name: 'Use libero' }).click();
  await expect(page.getByTestId('player').filter({ hasText: 'Libero' })).toHaveCount(1);

  await page.reload();
  await expect(page.getByRole('switch', { name: 'Use libero' })).toBeChecked();
  await expect(page.getByTestId('player').filter({ hasText: 'Libero' })).toHaveCount(1);

  // Practice uses the same setting.
  await page.getByRole('navigation').getByRole('link', { name: 'Practice' }).click();
  await expect(page.getByRole('switch', { name: 'Use libero' })).toBeChecked();
  await page.getByRole('button', { name: 'Show answer' }).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('practice-result')).toHaveText('6 of 6 correct, lineup legal');
  await expect(page.getByTestId('grade').filter({ hasText: 'Libero' })).toHaveCount(1);
});
