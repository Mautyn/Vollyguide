import { expect, test, type Page } from '@playwright/test';
import { withoutLibero } from './helpers';

test.beforeEach(({ page }) => withoutLibero(page));

/** Konva nodes by name, with whether each can be dragged. */
function nodes(page: Page, name: string) {
  return page.evaluate((selector) => {
    const konva = (
      window as unknown as {
        Konva?: { stages: { find(s: string): { draggable(): boolean }[] }[] };
      }
    ).Konva;
    return (konva?.stages[0]?.find(selector) ?? []).map((n) => n.draggable());
  }, `.${name}`);
}

test('in receive, Show opponent draws and lists the six opponent players', async ({ page }) => {
  await page.goto('court');
  const toggle = page.getByRole('switch', { name: 'Show opponent' });
  await expect(toggle).toBeDisabled();

  await page.getByRole('radio', { name: 'Receive' }).click();
  await expect(toggle).toBeEnabled();
  await toggle.click();

  const opponents = page.getByTestId('opponent-player');
  await expect(opponents).toHaveCount(6);
  // Their own frame: the server stands 1 m behind their end line, in their zone 1 (right).
  await expect(opponents.first()).toHaveText('S Setter 7.5 m from left · 10.0 m from net');

  await expect.poll(() => nodes(page, 'opponent')).toEqual(Array(6).fill(false));
  await expect.poll(() => nodes(page, 'player')).toEqual(Array(6).fill(true));

  // The overlap status still checks only our team.
  await expect(page.getByRole('status')).toHaveText(/legal/);
  await expect(page.getByTestId('player')).toHaveCount(6);

  // Back to base: the opponent is hidden again.
  await page.getByRole('radio', { name: 'Base' }).click();
  await expect(opponents).toHaveCount(0);
  await expect.poll(() => nodes(page, 'opponent')).toEqual([]);
});
