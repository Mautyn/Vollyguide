import { expect, test } from '@playwright/test';

test('step through the overlap rule lesson and see the fault on the illegal example', async ({
  page,
}) => {
  await page.goto('./');
  await page.getByRole('navigation').getByRole('link', { name: 'Lessons' }).click();
  await page.getByRole('link', { name: /The overlap rule/ }).click();

  await expect(page.getByTestId('step-counter')).toHaveText('Step 1 of 6');
  await expect(page.getByTestId('court-stage').locator('canvas').first()).toBeVisible();

  // Lesson courts are read-only.
  const draggable = await page.evaluate(() => {
    const konva = (
      window as unknown as {
        Konva?: { stages: { find(s: string): { draggable(): boolean }[] }[] };
      }
    ).Konva;
    return konva?.stages[0]?.find('.player').map((p) => p.draggable());
  });
  expect(draggable).toEqual([false, false, false, false, false, false]);

  for (let step = 2; step <= 5; step++) {
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByTestId('step-counter')).toHaveText(`Step ${step} of 6`);
  }
  await expect(page).toHaveURL(/\?step=5$/);
  await expect(
    page.getByRole('heading', { name: 'Illegal: the setter leaves too early' }),
  ).toBeVisible();
  await expect(page.getByRole('status')).toContainText(
    'Zone 2 must be closer to the net than zone 1.',
  );

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByTestId('step-counter')).toHaveText('Step 6 of 6');
  await expect(page.getByRole('status')).toContainText('Zone 5 must be left of zone 6.');

  await page.getByRole('link', { name: 'Back to lessons' }).click();
  await expect(page).toHaveURL(/\/lessons$/);
});

test('a shared step link opens that step', async ({ page }) => {
  await page.goto('lessons/5-1-serve-receive?step=4');
  await expect(page.getByRole('heading', { name: 'Rotation 5' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('legal');
});
