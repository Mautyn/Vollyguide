import { expect, test, type Page } from '@playwright/test';

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });

test('step by step: a side-out rotates us, a won serve keeps the server', async ({ page }) => {
  await page.goto('simulation');
  await expect(page.getByRole('heading', { name: 'Simulation', level: 1 })).toBeVisible();
  await expect(page.getByTestId('score')).toHaveText('0–0');
  await expect(page.getByTestId('sim-server')).toHaveText('their S');

  // They serve; we side-out with an outside attack.
  await button(page, 'Outside (zone 4)').click();
  await expect(page.getByTestId('scene-caption')).toContainText('attacks');
  await button(page, 'Point for us').click();
  await expect(page.getByTestId('score')).toHaveText('1–0');
  await expect(page.getByTestId('our-rotation')).toHaveText('6');
  await expect(page.getByTestId('sim-server')).toHaveText('OH1');
  await expect(page.getByTestId('rally-log')).toContainText('Side-out: we rotate to rotation 6.');

  // We serve; they attack, we dig and counter with a pipe, and win: same server.
  await button(page, 'Next rally').click();
  await button(page, 'Attack from their left').click();
  await button(page, 'Pipe (back row)').click();
  await button(page, 'Point for us').click();
  await expect(page.getByTestId('score')).toHaveText('2–0');
  await expect(page.getByTestId('our-rotation')).toHaveText('6');
  await expect(page.getByTestId('sim-server')).toHaveText('OH1');
  await expect(page.getByTestId('rally-log')).toContainText('OH1 serves again.');
  await expect(page.getByRole('status')).toHaveText(/legal/);
});

test('the automatic tour goes through all six rotations', async ({ page }) => {
  await page.goto('simulation');
  await page.getByRole('radio', { name: 'Automatic tour' }).click();
  await expect(page.getByTestId('tour-rally')).toHaveText('Rally 1 of 13');
  const rotations = new Set<string>([(await page.getByTestId('our-rotation').textContent())!]);
  for (let rally = 2; rally <= 13; rally++) {
    await button(page, 'Next rally').click();
    await expect(page.getByTestId('tour-rally')).toHaveText(`Rally ${rally} of 13`);
    rotations.add((await page.getByTestId('our-rotation').textContent())!);
  }
  expect([...rotations].sort()).toEqual(['1', '2', '3', '4', '5', '6']);
  await expect(page.getByTestId('rally-log').getByRole('listitem')).toHaveCount(12);
});

test('the simulation in Polish', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('volleyguide:locale', 'pl'));
  await page.goto('simulation');
  await expect(page.getByRole('heading', { name: 'Symulacja', level: 1 })).toBeVisible();
  await expect(page.getByTestId('sim-server')).toHaveText('R przeciwnika');
  await button(page, 'Skrzydło (strefa 4)').click();
  await button(page, 'Punkt dla nas').click();
  await expect(page.getByTestId('rally-log')).toContainText(
    'Punkt na przyjęciu: przechodzimy do ustawienia 6. Teraz zagrywa P1.',
  );
});

test('the simulation fits a 375 px phone, with its header link in view', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const locale of ['en', 'pl']) {
    await page.addInitScript((l) => window.localStorage.setItem('volleyguide:locale', l), locale);
    await page.goto('simulation');
    await expect(page.getByTestId('score')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const link = page.getByRole('navigation').getByRole('link', {
      name: locale === 'en' ? 'Simulation' : 'Symulacja',
    });
    await expect(link).toBeInViewport();
    await expect(page.getByTestId('language-switcher')).toBeInViewport();
  }
});
