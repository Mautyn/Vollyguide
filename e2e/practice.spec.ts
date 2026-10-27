import { expect, test, type Page } from '@playwright/test';

/** Names of the practice marks drawn around players on the Konva stage. */
function markNames(page: Page) {
  return page.evaluate(() => {
    const konva = (
      window as unknown as {
        Konva?: { stages: { find(s: string): { name(): string }[] }[] };
      }
    ).Konva;
    const stage = konva?.stages[0];
    if (!stage) return [];
    return [...stage.find('.mark-correct'), ...stage.find('.mark-wrong')].map((n) => n.name());
  });
}

test('Show answer then Check scores 6 of 6 in rotation 1 base', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('navigation').getByRole('link', { name: 'Practice' }).click();
  await expect(page.getByTestId('practice-task')).toHaveText('Rotation 1, base');

  await page.getByRole('button', { name: 'Show answer' }).click();
  await page.getByRole('button', { name: 'Check' }).click();

  await expect(page.getByTestId('practice-result')).toHaveText('6 of 6 correct, lineup legal');
  await expect.poll(() => markNames(page)).toEqual(Array(6).fill('mark-correct'));
});

test('Check with everyone on the bench scores 0 correct', async ({ page }) => {
  await page.goto('practice');
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('button', { name: 'Check' }).click();

  await expect(page.getByTestId('practice-result')).toHaveText(/^0 of 6 correct/);
  await expect(page.getByTestId('grade')).toHaveCount(6);
  await expect.poll(() => markNames(page)).toEqual(Array(6).fill('mark-wrong'));
});

test('dragging one player onto their spot scores 1 correct', async ({ page }) => {
  await page.goto('practice');
  await page.getByRole('button', { name: 'Try again' }).click();

  const box = await page.getByTestId('court-stage').locator('canvas').first().boundingBox();
  if (!box) throw new Error('canvas not visible');
  const pxPerMeter = box.width / 15; // 9 m court + 3 m free zone on each side
  const toPage = (x: number, y: number) => ({
    x: box.x + (x + 3) * pxPerMeter,
    y: box.y + (18 + 3 - y) * pxPerMeter,
  });

  // The setter is first on the bench at (-1.5, 0.75); its rotation 1 base spot is (7.5, 3).
  const from = toPage(-1.5, 0.75);
  const to = toPage(7.5, 3);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.mouse.up();

  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('practice-result')).toHaveText(/^1 of 6 correct/);
  await expect(page.getByTestId('grade').first()).toContainText('on the spot');
});
