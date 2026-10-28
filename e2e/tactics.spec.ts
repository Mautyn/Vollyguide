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

test('coverage: the outside hitter attack plays to the end', async ({ page }) => {
  await page.goto('tactics');
  await page
    .getByRole('navigation', { name: 'Topics' })
    .getByRole('link', { name: 'Coverage' })
    .click();
  await page.getByRole('link', { name: 'Outside hitter attacks from zone 4' }).click();
  await expect(page).toHaveURL(/\/tactics\/coverage\/outside-hitter-attacks-zone-4$/);

  await expect(page.getByTestId('moment-counter')).toHaveText('Moment 4 of 4', { timeout: 6000 });
  await expect(page.getByTestId('scene-caption')).toHaveText(
    'The block sends the ball straight back. It drops into the cup, where the setter is already low to dig it.',
  );
});

test('defense: every situation plays to its final caption', async ({ page }) => {
  const situations = [
    ['Attack from the opponent’s left side', 'the cross-court defender digs it.'],
    ['Attack from the opponent’s right side', 'as cross-court defender, digs it.'],
    ['Attack from the middle', 'the middle-back digs it deep in the middle.'],
    ['Tip over the block', 'calls “Mine!” and digs it'],
  ] as const;

  await page.goto('tactics');
  await page
    .getByRole('navigation', { name: 'Topics' })
    .getByRole('link', { name: 'Defense' })
    .click();
  await expect(page.getByRole('heading', { name: 'Who is attacking?' })).toBeVisible();

  for (const [title, ending] of situations) {
    await page
      .getByRole('navigation', { name: 'Situations' })
      .getByRole('link', { name: title })
      .click();
    await expect(page.getByRole('heading', { name: title, level: 2 })).toBeVisible();
    await expect(page.getByTestId('moment-counter')).toHaveText('Moment 4 of 4', { timeout: 6000 });
    await expect(page.getByTestId('scene-caption')).toContainText(ending);
  }
});
