import { expect, test, type Page } from '@playwright/test';
import { withoutLibero } from './helpers';

/** Number of Konva nodes with this name on the court. */
function countNodes(page: Page, name: string) {
  return page.evaluate((selector) => {
    const konva = (window as unknown as { Konva?: { stages: { find(s: string): unknown[] }[] } })
      .Konva;
    return konva?.stages[0]?.find(selector).length ?? 0;
  }, `.${name}`);
}

const row = (page: Page, label: string) =>
  page.getByTestId('player').filter({ hasText: new RegExp(`^${label} `) });

test('Serve shows the server behind the end line and Switch moves everyone to defense', async ({
  page,
}) => {
  await withoutLibero(page);
  await page.goto('court');
  await page.getByRole('radio', { name: 'Serve' }).click();

  // Rotation 1: the setter serves from 1 m behind the end line, with the ball next to them.
  await expect(row(page, 'S')).toHaveText('S Setter 7.5 m from left · 10.0 m from net');
  await expect.poll(() => countNodes(page, 'ball')).toBe(1);
  await expect(page.getByRole('status')).toHaveText(/legal/);
  await expect(page.getByTestId('formation-note')).toContainText('zone-1 player serves');

  await page.getByRole('button', { name: 'Switch' }).click();
  await expect(row(page, 'S')).toHaveText('S Setter 8.0 m from left · 6.0 m from net');
  await expect(row(page, 'OPP')).toHaveText('OPP Opposite 7.5 m from left · 0.6 m from net');
  await expect(row(page, 'OH1')).toHaveText('OH1 Outside hitter 1.5 m from left · 0.6 m from net');
  await expect(row(page, 'MB1')).toHaveText('MB1 Middle blocker 1.2 m from left · 6.0 m from net');
  await expect(page.getByTestId('after-serve')).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect.poll(() => countNodes(page, 'ball')).toBe(0);

  await page.getByRole('button', { name: 'Back to serve' }).click();
  await expect(row(page, 'S')).toHaveText('S Setter 7.5 m from left · 10.0 m from net');
  await expect(page.getByRole('status')).toHaveText(/legal/);
});

test('with the libero on, the libero serves for MB1 and MB2 serves its own turn', async ({
  page,
}) => {
  await page.goto('court');
  await expect(page.getByRole('switch', { name: 'Use libero' })).toBeChecked();
  await page.getByRole('radio', { name: 'Serve' }).click();

  // Rotation 2: MB1 is in zone 1, so the libero serves and MB1 waits on the bench.
  await page.getByRole('radio', { name: 'Rotation 2' }).click();
  await expect(row(page, 'L')).toHaveText('L Libero 7.5 m from left · 10.0 m from net');
  await expect(row(page, 'MB1')).toContainText('Bench');

  // After the switch the libero defends left back.
  await page.getByRole('button', { name: 'Switch' }).click();
  await expect(row(page, 'L')).toHaveText('L Libero 1.2 m from left · 6.0 m from net');

  // Rotation 5: MB2 is in zone 1 and serves; the libero is on the bench.
  await page.getByRole('radio', { name: 'Rotation 5' }).click();
  await expect(row(page, 'MB2')).toHaveText('MB2 Middle blocker 7.5 m from left · 10.0 m from net');
  await expect(row(page, 'L')).toContainText('Bench');
});
