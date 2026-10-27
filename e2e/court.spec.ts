import { expect, test } from '@playwright/test';

test('court page loads and shows 6 players', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Open the court' }).click();

  await expect(page).toHaveURL(/\/court$/);
  await expect(page.getByTestId('court-stage').locator('canvas').first()).toBeVisible();
  await expect(page.getByTestId('player')).toHaveCount(6);

  const playerCount = await page.evaluate(() => {
    const konva = (window as unknown as { Konva?: { stages: { find(s: string): unknown[] }[] } })
      .Konva;
    return konva?.stages[0]?.find('.player').length;
  });
  expect(playerCount).toBe(6);
});

test('dragging a player updates its position in meters', async ({ page }) => {
  await page.goto('/court');
  const setter = page.getByTestId('player').first();
  await expect(setter).toHaveText('S Setter: x 7.5 m, y 3.0 m');

  const box = await page.getByTestId('court-stage').locator('canvas').first().boundingBox();
  if (!box) throw new Error('canvas not visible');
  const pxPerMeter = box.width / 15; // 9 m court + 3 m free zone on each side
  const start = { x: box.x + (7.5 + 3) * pxPerMeter, y: box.y + (18 + 3 - 3) * pxPerMeter };

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x - pxPerMeter, start.y - pxPerMeter, { steps: 5 });
  await page.mouse.up();

  await expect(setter).toHaveText('S Setter: x 6.5 m, y 4.0 m');
});

test('picking a rotation moves the players to its base positions', async ({ page }) => {
  await page.goto('court');
  await page.getByRole('button', { name: 'Rotation 4' }).click();

  await expect(page.getByRole('button', { name: 'Rotation 4' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByTestId('player').first()).toHaveText('S Setter: x 1.5 m, y 7.5 m');
  await expect(page.getByRole('status')).toHaveText(/legal/);
});
