import { test, expect, go, rows } from './demo';

test('#106 picked rows next to each other are joined into one block', async ({ demo: page }) => {
  await go(page, '#/inbox');
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Shift+ArrowDown');

  const picked = page.locator('.screen.active .task.picked');
  await expect(picked).toHaveCount(3);
  await expect(picked.nth(0)).toHaveClass(/join-down/);
  await expect(picked.nth(0)).not.toHaveClass(/join-up/);
  await expect(picked.nth(1)).toHaveClass(/join-up join-down|join-down join-up/);
  await expect(picked.nth(2)).toHaveClass(/join-up/);
  await expect(picked.nth(2)).not.toHaveClass(/join-down/);
  expect(await picked.nth(1).evaluate((row) => getComputedStyle(row).borderTopLeftRadius)).toBe('0px');

  // A gap in the selection makes two blocks.
  await rows(page).nth(1).click({ modifiers: ['ControlOrMeta'] });
  await expect(page.locator('.screen.active .task.picked.join-up')).toHaveCount(0);
});
