import { test, expect } from '@playwright/test';

test('Page Load', async({ page }) => {
  await page.goto('https://www.basketball-reference.com//');
  await expect(page.getByRole('img', { name: 'Basketball-Reference.com Logo' })).toBeVisible();
  console.log('Main Basketball Reference page loaded!');
});

test('Player Search', async({ page }) => {
  await page.goto('https://www.basketball-reference.com//');
  await page.getByRole('searchbox', { name: 'Enter a player, team or section name'}).fill('Jaden Ivey');

  await page.getByText('Jaden Ivey').nth(0).click();
  await expect(page).toHaveURL(/\/iveyja01/);
  console.log('Succesfully Navigated to Player page!');
});

test('Basketball Reference Main Page', async( {page} ) => {
  await page.goto('https://www.sports-reference.com/');
  await page.getByRole('link', { name: 'Basketball-Reference'}).nth(0).click();
  await expect(page.getByRole('img', { name: 'Basketball-Reference.com Logo' })).toBeVisible();
})