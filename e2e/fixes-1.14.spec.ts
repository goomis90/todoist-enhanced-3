import { expect, go, row, rows, test, titles } from './demo';

test('task shortcuts follow the arrow keys, never the mouse pointer (#90)', async ({ demo: page }) => {
  const [first, second] = await titles(page);
  await page.locator('h1').first().click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('1');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(row(page, second).getByRole('checkbox', { name: 'Complete task' })).toHaveClass(/\bp1\b/);

  // Hovering another task does not move the cursor: letters still search.
  await page.locator('h1').first().click();
  await row(page, first).hover();
  await page.keyboard.press('e');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(row(page, first)).toBeVisible();
});

test('⌘A selects every open task in the list (#89)', async ({ demo: page }) => {
  const count = await rows(page).count();
  await page.locator('h1').first().click();
  await page.keyboard.press('ControlOrMeta+a');
  await expect(page.getByRole('toolbar')).toContainText(`${count} selected`);
  // Again: the whole selection stays.
  await page.keyboard.press('ControlOrMeta+a');
  await expect(page.getByRole('toolbar')).toContainText(`${count} selected`);
});

test('a bulk toast stands above the bulk-edit bar (#88)', async ({ demo: page }) => {
  const picked = (await titles(page)).slice(0, 2);
  for (const title of picked) await row(page, title).click({ modifiers: ['ControlOrMeta'] });
  const bar = page.getByRole('toolbar');
  await bar.getByRole('button', { name: 'Tags' }).click();
  await page.locator('.bulkpop .checkrow').first().click();

  const toast = page.locator('.toast').first();
  await expect(toast).toBeVisible();
  const toastBox = (await toast.boundingBox())!;
  const barBox = (await bar.boundingBox())!;
  const panelBox = (await page.locator('.bulkpop').boundingBox())!;
  expect(toastBox.y + toastBox.height).toBeLessThanOrEqual(Math.min(barBox.y, panelBox.y));
});

test('a row menu on a short board stays inside the board (#87)', async ({ demo: page }) => {
  await go(page, '#/project/site');
  await page.getByRole('button', { name: 'Display' }).click();
  await page.getByRole('button', { name: 'Board' }).click();
  await page.keyboard.press('Escape');

  const board = page.locator('.screen.active .board');
  const last = board.locator('.col').first().locator('[data-task-id]').last();
  await last.hover();
  for (const name of ['Schedule', 'Move to project']) {
    await last.getByRole('button', { name }).click();
    const menu = page.locator('.rowmenu');
    await expect(menu).toBeVisible();
    const menuBox = (await menu.boundingBox())!;
    const boardBox = (await board.boundingBox())!;
    expect(menuBox.x).toBeGreaterThanOrEqual(boardBox.x - 1);
    expect(menuBox.y).toBeGreaterThanOrEqual(boardBox.y - 1);
    expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(boardBox.y + boardBox.height + 1);
    await page.keyboard.press('Escape');
    await last.hover();
  }
});
