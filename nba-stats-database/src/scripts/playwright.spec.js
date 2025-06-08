// const { chromium } = require('playwright'); // Import Playwright

// (async () => {
//     // Launch the browser (headless mode false for visibility)
//     const browser = await chromium.launch({ headless: false });

//     // Open a new page
//     const page = await browser.newPage();

//     // Navigate to a website
//     await page.goto('https://example.com');

//     // Click a button using Locator (Recommended over direct selectors)
//     const startButton = page.locator('#start-button');
//     await startButton.click();

//     // Fill an input field using Locator
//     const searchField = page.locator('#search');
//     await searchField.fill('Playwright Test');

//     // Select an option from a dropdown
//     await page.selectOption('#dropdown', 'option1');

//     // Type input using keyboard simulation
//     await page.keyboard.type('Hello, Playwright!');

//     // Hover over an element before clicking (useful for dropdowns)
//     const menuItem = page.locator('#menu-item');
//     await menuItem.hover();

//     // Scroll to an element before interacting (useful for long pages)
//     const footer = page.locator('#footer');
//     await footer.scrollIntoViewIfNeeded();

//     // Take a screenshot for debugging
//     await page.screenshot({ path: 'screenshot.png' });

//     // Wait for a dynamically loading element (e.g., async content)
//     await page.waitForSelector('#loaded-content');

//     // Handle navigation by waiting for the network request to complete
//     await page.waitForLoadState('networkidle');

//     // Extract and log text content from an element
//     const resultText = await page.textContent('#result');
//     console.log(`Result: ${resultText}`);

//     // Close the browser
//     await browser.close();
// })();

// const { chromium } = require('playwright'); // Import Playwright


// const {chromium} = require('playwright'); 

// (async () => {
//     await page.goto('https://sports-reference.com/about.html');

//     const basketball = locator('#main_nav > li:nth-child(2) > a')
//     await basketball.click();

//     const currentURL = page.url('https://www.basketball-reference.com/?__hstc=213859787.610a818ca0865afd8957b5f56df89a26.1748572351534.1748572351534.1748637569989.2&__hssc=213859787.1.1748637569989&__hsfp=2332789450');
//     console.log(`current URL: ${currentURL}`);

//     if(currentURL === 'https://www.basketball-reference.com/?__hstc=213859787.610a818ca0865afd8957b5f56df89a26.1748572351534.1748572351534.1748637569989.2&__hssc=213859787.1.1748637569989&__hsfp=2332789450') {
//         console.log('navigation successful')}
//     else {
//         console.log('navigation failed')
//     }
// })

// const { chromium } = require('playwright'); // Import Playwright

// (async () => {
//     // Launch browser
//     const browser = await chromium.launch({ headless: false });
//     const page = await browser.newPage();

//     // Navigate to the initial page
//     await page.goto('https://sports-reference.com/about.html');

//     // Locate and click the basketball link
//     const basketball = page.locator('#main_nav > li:nth-child(2) > a');
//     await basketball.click();

//     // Wait for navigation to complete
//     await page.waitForLoadState('networkidle');

//     // Get the current URL
//     const currentURL = page.url();
//     console.log(`Current URL: ${currentURL}`);

//     // Verify navigation success
//     const expectedURL = 'https://www.basketball-reference.com/';
//     if (currentURL.startsWith(expectedURL)) {
//         console.log('✅ Navigation successful!');
//     } else {
//         console.log('❌ Navigation failed!');
//     }

//     // Close the browser
//     await browser.close();
// })();


// (async () =>{
//     const browser = await chromium.launch({headless: true});
//     const page = await browser.newPage();

//     //Navigate to Google
//     const googleBaseURL = 'https://www.google.com/';
//     await page.goto(`${googleBaseURL}`);
//     const PageURL = page.url();

//     if (PageURL === googleBaseURL) {
//         console.log('Have successfully reached Google.');
//     }
//     else {
//         console.log('Failed');
//     }

//     await browser.close();
// })

const { chromium } = require('playwright');

(async() => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://www.google.com');

    await browser.close();

})();

const  {chromium}  = require('playwright');

(async() => {
    const browser = await chromium.launch({headless: true});
    const page = await browser.newPage();

    await page.goto('https://www.google.com/');

    await browser.close();
})();


import { test, expect } from '@playwright/test'; // Playwright Test handles setup

test('Verify Google homepage loads', async ({ page }) => {
    await page.goto('https://www.google.com/');
    expect(page.url()).toBe('https://www.google.com/');
});

import { test, expect } from '@playwright/test';

test('Wikipedia Test', async ({ page }) => {
    await page.goto('https://www.wikipedia.org/');

    // Corrected locator for the search bar
    const searchBar = page.locator('#searchInput'); 
    await searchBar.fill('Playwright');

    // Corrected locator for the search button
    const searchBtn = page.locator('.search-input-button'); 
    await searchBtn.click();

    // Wait for search results to load
    await page.waitForSelector('#firstHeading');

    // Verify that the page title contains "Playwright"
    const pageTitle = await page.textContent('#firstHeading');
    expect(pageTitle).toContain('Playwright');
});

import { test, expect } from '@playwright/test';

test('Forgot Password Validaiton', async({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/forgot_password');
    await expect(page).toHaveTitle('Forgot Password');
    
    await page.getByRole('textbox', { name: /E-mail/i}).fill('test@example.com');
    await page.getByRole('button', { name: /Retrieve password/i}).click();

    await expect(page.getByText("Your e-mail's been sent!")).toBeVisible();
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/sent');

    console.log('Email has sent successfully!');
})

import  {test, expect } from '@playwright/test';

test('dynamic loading test', async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/dynamic_loading/2');
    await expect(page.getByText('Example 2: Element rendered after the fact')).toBeVisible();
    
    await page.getByRole('button', {name: /Start/i}).click();

    await expect(page.getByText('Loading...').toBeVisible());
    await expect(page.getByText('Loading...').toBeHidden());
    await expect(page.getByText('Hello World!').toBeVisible());

    console.log('Text is visible');

})

import { test, expect } from '@playwright/test';

test('assertion hidden test', async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/dynamic_loading/2');
    await expect(page.getByText('Example 2: Element rendered after the fact')).toBeVisible();
    
    await expect(page.getByText('Hello World!')).toBeHidden();
    await page.getByRole('button', {name: /Start/i}).click();

    await expect(page.getByText('Loading...')).toBeVisible();
    await expect(page.getByText('Loading...')).toBeHidden();
    await expect(page.getByText('Hello World!')).toBeVisible();
    
    console.log('Successful!');
})

import { test, expect } from '@playwright/test';

test('forgot password test', async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/forgot_password');
    await expect(page).tohaveTitle('Forgot Password');

    await page.getByRole('textbox', { name: /E-mail/i}).fill('test@example.com');
    await page.getByRole('button', { name: /Retrieve password/i}).click();
    await expect(page.getByText("Your email's been sent!")).toBeVisible();
    await expect(page).toHaveUrl('https://the-internet.herokuapp.com/sent');
    console.log('successful!');
})

import { test, expect } from '@playwright/test';

test('frogot password test', async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/forgot_password');
    await expect(page).toHaveTitle('Forgot Password');
    await page.getByRole('textbox', { name: /E-mail/i }).fill('test@example.com');
    await page.getByRole('button', { name: /retrieve Password/i }).click();
    await expect(page.getByText("Your emails been sent!")).toBeVisible();
})

await page.getByRole('textbox', { name: /E-mail/i }).fill('test@example.com');

const passwordText = page.getByRole('textbox', { name: /E-mail/i });
await passwordText.fill('test@example.com');