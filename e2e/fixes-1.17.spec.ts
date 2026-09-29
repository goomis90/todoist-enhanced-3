import { expect, go, row, test } from './demo';

test('#143 a date typed with a time keeps the time', async ({ demo: page }) => {
  await page.keyboard.press('q');
  await page.locator('.composer-name').fill('Call the plumber');

  const face = page.locator('.composer-chips .datefield button').first();
  await face.click();
  await page.locator('.datepanel input').fill('tomorrow at 14:30');
  // The line under the field says what will be kept, time included.
  await expect(page.locator('.datepanel .pickerreading')).toContainText('14:30');
  await page.keyboard.press('Enter');
  await expect(face).toContainText('14:30');

  await page.keyboard.press('ControlOrMeta+Enter');
  await expect(page.locator('.composerbox')).toHaveCount(0);

  await go(page, '#/upcoming');
  await expect(row(page, 'Call the plumber')).toContainText('14:30');
});

test('#143 a deadline is a day: the time typed there is said to be left out', async ({ demo: page }) => {
  await page.keyboard.press('q');
  await page.locator('.composer-name').fill('Send the quote');
  await page.getByRole('button', { name: 'Deadline' }).click();
  await page.locator('.datepanel input').fill('tomorrow at 14:30');
  await expect(page.locator('.datepanel .pickerreading')).toContainText('takes a day only');
  await page.keyboard.press('Enter');
  await expect(page.locator('.datepanel')).toHaveCount(0);
});

test('#144 an address is not a priority: only what is typed beside it is read', async ({ demo: page }) => {
  await page.keyboard.press('q');
  const name = page.locator('.composer-name');
  await name.fill('Read https://example.com/p1');
  await expect(page.locator('.namefield .nmark.priority')).toHaveCount(0);
  await name.fill('Read https://example.com p1');
  await expect(page.locator('.namefield .nmark.priority')).toHaveCount(1);
});

/*
 * The demo saves in the same breath, so a real double click never catches it
 * mid-save. Two events in one task do: the second arrives before the first
 * one's promise has settled, which is exactly the window a slow save leaves open.
 */
test('#142 two clicks on Add in the same moment create one task, not two', async ({ demo: page }) => {
  await page.keyboard.press('q');
  await page.locator('.composer-name').fill('Book the train');
  await page.getByRole('button', { name: 'Add task', exact: true }).last()
    .evaluate((button: HTMLElement) => { button.click(); button.click(); });
  await expect(page.locator('.composerbox')).toHaveCount(0);

  await go(page, '#/inbox');
  await expect(page.locator('.screen.active [data-task-id]').filter({ hasText: 'Book the train' })).toHaveCount(1);
});

test('#142 Cmd+Enter pressed twice in the same moment creates one task', async ({ demo: page }) => {
  await page.keyboard.press('q');
  const name = page.locator('.composer-name');
  await name.fill('Renew the passport');
  await name.evaluate((field: HTMLElement) => {
    const press = () => field.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, metaKey: true, bubbles: true }),
    );
    press();
    press();
  });
  await expect(page.locator('.composerbox')).toHaveCount(0);

  await go(page, '#/inbox');
  await expect(page.locator('.screen.active [data-task-id]').filter({ hasText: 'Renew the passport' })).toHaveCount(1);
});
