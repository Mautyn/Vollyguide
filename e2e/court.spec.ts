import { expect, test } from '@playwright/test';

test('court page loads and shows 6 players', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: 'Open the court' }).click();

  await expect(page).toHaveURL(/\/Vollyguide\/court$/);
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
  await page.goto('court');
  const setter = page.getByTestId('player').first();
  await expect(setter).toHaveText('S Setter 7.5 m from left · 6.0 m from net');

  const box = await page.getByTestId('court-stage').locator('canvas').first().boundingBox();
  if (!box) throw new Error('canvas not visible');
  const pxPerMeter = box.width / 15; // 9 m court + 3 m free zone on each side
  const start = { x: box.x + (7.5 + 3) * pxPerMeter, y: box.y + (18 + 3 - 3) * pxPerMeter };

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x - pxPerMeter, start.y - pxPerMeter, { steps: 5 });
  await page.mouse.up();

  await expect(setter).toHaveText('S Setter 6.5 m from left · 5.0 m from net');
});

test('picking a rotation moves the players to its base positions', async ({ page }) => {
  await page.goto('court');
  await page.getByRole('radio', { name: 'Rotation 4' }).click();

  await expect(page.getByRole('radio', { name: 'Rotation 4' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.getByTestId('player').first()).toHaveText(
    'S Setter 1.5 m from left · 1.5 m from net',
  );
  await expect(page.getByRole('status')).toHaveText(/legal/);
});

test('switching to Receive in rotation 1 shows the legal serve-receive formation', async ({
  page,
}) => {
  await page.goto('court');
  await page.getByRole('radio', { name: 'Receive' }).click();

  await expect(page.getByRole('radio', { name: 'Receive' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.getByTestId('player')).toHaveText([
    'S Setter 8.5 m from left · 5.5 m from net',
    'OH1 Outside hitter 7.5 m from left · 5.0 m from net',
    'MB2 Middle blocker 4.5 m from left · 0.5 m from net',
    'OPP Opposite 1.0 m from left · 0.5 m from net',
    'OH2 Outside hitter 1.5 m from left · 5.0 m from net',
    'MB1 Middle blocker 4.5 m from left · 5.0 m from net',
  ]);
  await expect(page.getByRole('status')).toHaveText(/legal/);
  await expect(page.getByTestId('formation-note')).toContainText('Setter in 1');

  // After the animation the setter is drawn at its receive spot.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const konva = (
          window as unknown as {
            Konva?: { stages: { find(s: string): { x(): number; y(): number }[] }[] };
          }
        ).Konva;
        const setter = konva?.stages[0]?.find('.player')[0];
        return setter ? [Math.round(setter.x()), Math.round(setter.y())] : null;
      }),
    )
    .toEqual(await expectedSetterPixels(page));
});

/** Pixel position of (8.5 m, 3.5 m) on the stage: 3 m free zone, our end line at the bottom. */
async function expectedSetterPixels(page: import('@playwright/test').Page) {
  const box = await page.getByTestId('court-stage').locator('canvas').first().boundingBox();
  if (!box) throw new Error('canvas not visible');
  const pxPerMeter = box.width / 15;
  return [Math.round((8.5 + 3) * pxPerMeter), Math.round((18 + 3 - 3.5) * pxPerMeter)];
}

test('the court shows distances from the net on both halves', async ({ page }) => {
  await page.goto('court');
  await expect(page.getByTestId('player')).toHaveCount(6);
  const labels = await page.evaluate(() => {
    const konva = (
      window as unknown as {
        Konva?: { stages: { find(s: string): { text(): string; y(): number }[] }[] };
      }
    ).Konva;
    return (konva?.stages[0]?.find('.distance-marker') ?? [])
      .map((n) => [n.y(), n.text()] as const)
      .sort((a, b) => a[0] - b[0])
      .map(([, text]) => text);
  });
  // Top to bottom: opponent end line, ..., net, ..., our end line.
  expect(labels).toEqual(['9 m', '6 m', '3 m', '0 m', '3 m', '6 m', '9 m']);
});
