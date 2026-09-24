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

test('keys on a selection act on all of it; a priority keeps the selection', async ({ demo: page }) => {
  const picked = (await titles(page)).slice(0, 3);
  for (const title of picked) await row(page, title).click({ modifiers: ['ControlOrMeta'] });
  const bar = page.getByRole('toolbar');
  await expect(bar).toContainText('3 selected');

  await page.keyboard.press('2');
  for (const title of picked) {
    await expect(row(page, title).getByRole('checkbox', { name: 'Complete task' })).toHaveClass(/\bp2\b/);
  }
  await expect(page.locator('.toast')).toContainText('3 tasks set to P2');
  await expect(bar).toContainText('3 selected');

  // T and V open the bar's own panels for the whole selection.
  await page.keyboard.press('t');
  await expect(page.getByRole('menu', { name: 'Date' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('v');
  await expect(page.getByRole('menu', { name: 'Move' })).toBeVisible();
  await expect(page.getByRole('menu', { name: 'Move' }).getByRole('textbox')).toBeFocused();
});

test('after a priority change, T and V still reach the selection, and the panels work from the keys', async ({ demo: page }) => {
  const picked = (await titles(page)).slice(0, 3);
  for (const title of picked) await row(page, title).click({ modifiers: ['ControlOrMeta'] });

  // A priority that re-sorts the list, then T: the Date panel, not the search.
  await page.keyboard.press('4');
  await page.keyboard.press('1');
  await page.keyboard.press('t');
  const date = page.getByRole('menu', { name: 'Date' });
  await expect(date).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.press('ArrowDown');
  await expect(date.locator(':focus')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(date).toHaveCount(0);
  await expect(page.getByRole('toolbar')).toContainText('3 selected');

  // V: the Move panel; Escape closes it even from its search field.
  await page.keyboard.press('v');
  const move = page.getByRole('menu', { name: 'Move' });
  await expect(move.getByRole('textbox')).toBeFocused();
  await page.keyboard.type('Ho');
  await page.keyboard.press('ArrowDown');
  await expect(move.getByRole('button', { name: /Home/ })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(move).toHaveCount(0);

  // The cursor is back on the selection: another key still acts on it.
  await page.keyboard.press('3');
  for (const title of picked) {
    await expect(row(page, title).getByRole('checkbox', { name: 'Complete task' })).toHaveClass(/\bp3\b/);
  }
});

test('Shift+↓ and Shift+↑ grow and shrink the selection from the cursor', async ({ demo: page }) => {
  const all = await titles(page);
  await page.locator('h1').first().click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Shift+ArrowDown');
  const bar = page.getByRole('toolbar');
  await expect(bar).toContainText('3 selected');
  for (const title of all.slice(0, 3)) await expect(row(page, title)).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Shift+ArrowUp');
  await expect(bar).toContainText('2 selected');
  await expect(row(page, all[2])).not.toHaveAttribute('aria-selected', 'true');

  // The keys then act on the whole range.
  await page.keyboard.press('4');
  await expect(page.locator('.toast')).toContainText('2 tasks set to P4');
});

test('⌘↓ and ⌘↑ move the task under the cursor, and the cursor goes with it', async ({ demo: page }) => {
  await page.goto('/#/project/home');
  await expect(page.locator('.screen.active [data-task-id]').first()).toBeVisible();
  const before = await titles(page);
  expect(before.length).toBeGreaterThan(2);

  // Nothing focused (a project's title is an editable field, so no click on it).
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ControlOrMeta+ArrowDown');
  await expect.poll(() => titles(page)).toEqual([before[1], before[0], ...before.slice(2)]);
  await page.keyboard.press('ControlOrMeta+ArrowDown');
  await expect.poll(() => titles(page)).toEqual([before[1], before[2], before[0], ...before.slice(3)]);
  await page.keyboard.press('ControlOrMeta+ArrowUp');
  await expect.poll(() => titles(page)).toEqual([before[1], before[0], ...before.slice(2)]);

  // Still on the moved task: a priority key lands on it.
  await page.keyboard.press('1');
  await expect(row(page, before[0]).getByRole('checkbox', { name: 'Complete task' })).toHaveClass(/\bp1\b/);
});
