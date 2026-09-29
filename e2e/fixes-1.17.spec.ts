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
