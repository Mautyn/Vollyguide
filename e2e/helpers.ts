import type { Page } from '@playwright/test';

/**
 * Turns the libero off before the page loads, for tests about the six-player lineup.
 * The libero is on by default; its own behaviour is covered in libero.spec.ts.
 */
export async function withoutLibero(page: Page): Promise<void> {
  await page.addInitScript(() => window.localStorage.setItem('volleyguide:useLibero', 'false'));
}
