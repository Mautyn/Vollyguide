import { expect, test, type Page } from '@playwright/test';

const overflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('with a Polish browser', () => {
  test.use({ locale: 'pl-PL' });

  test('the site opens in Polish', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Naucz się profesjonalnego ustawienia w siatkówce',
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl');

    await page.getByRole('navigation').getByRole('link', { name: 'Boisko' }).click();
    await expect(page.getByTestId('player').first()).toHaveText(
      'R Rozgrywający 7,5 m od lewej · 6,0 m od siatki',
    );
    await expect(page.getByRole('status')).toHaveText(
      'Ustawienie w momencie zagrywki jest prawidłowe.',
    );
  });

  test('the switcher changes to English and the choice survives a reload', async ({ page }) => {
    await page.goto('court');
    await page.getByTestId('language-switcher').click();
    await expect(page.getByTestId('player').first()).toHaveText(
      'S Setter 7.5 m from left · 6.0 m from net',
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Court', level: 1 })).toBeVisible();

    await page.getByTestId('language-switcher').click();
    await expect(page.getByRole('heading', { name: 'Boisko', level: 1 })).toBeVisible();
  });

  test('lessons and tactics are in Polish', async ({ page }) => {
    await page.goto('lessons/overlap-rule?step=5');
    await expect(
      page.getByRole('heading', { name: 'Błąd: rozgrywający wychodzi za wcześnie' }),
    ).toBeVisible();
    await expect(page.getByRole('status')).toContainText(
      'Zawodnik ze strefy 2 musi być bliżej siatki niż zawodnik ze strefy 1.',
    );

    await page.goto('tactics/defense/attack-from-left-side');
    await expect(page.getByRole('heading', { name: 'Kto atakuje?' })).toBeVisible();
    await expect(page.getByTestId('moment-counter')).toHaveText('Moment 4 z 4', { timeout: 6000 });
  });

  test('the header fits a 375 px phone screen in Polish and in English', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('practice');
    await expect(page.getByRole('heading', { name: 'Trening', level: 1 })).toBeVisible();
    expect(await overflow(page)).toBeLessThanOrEqual(0);

    await page.getByTestId('language-switcher').click();
    await expect(page.getByRole('heading', { name: 'Practice', level: 1 })).toBeVisible();
    expect(await overflow(page)).toBeLessThanOrEqual(0);
  });
});

test('an English browser opens in English', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByTestId('language-switcher')).toHaveText('PL');
});
