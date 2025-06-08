//Challenge One
import { test, expect } from '@playwright/test';

test('Challenge One', async( {page} ) => {
    await page.goto('https://wikipedia.org/');
    await expect(page).toHaveTitle(/.*wikipedia/i);
    await expect(page.getByRole('searchbox', {name: 'Search Wikipedia'})).toBeVisible();

    console.log('Search Bar is visible');
});

//Challenge Two

test('Challenge Two', async( {page} ) =>{
    await page.goto('https://the-internet.herokuapp.com/forgot_password');
    await expect(page).toHaveTitle('Forgot Password');
    
    await page.getByRole('textbox', { name: /E-mail/i }).fill('test@example.com');
    await page.getByRole('button', { name: /Retrieve password/i }).click();
    
    await expect(page.getByText("Your e-mail's been sent!")).toBeVisible();
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/sent');

});

//Challenge Three

test('Challenge Three', async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/login');
    await expect(page).toHaveTitle('Login');
    await page.getByRole('textbox', {name: 'Username'}).fill('tomsmith');
    await page.getByRole('textbox', {name: 'Password'}).fill('SuperSecretPassword!');
    await page.getByRole('button', {name: 'Login'}).click();
    await expect (page.getByText('You logged into a secure area!').toBeVisible());
    await expect(page).toHaveURL('/\/secure/');
});

//Challenge Five
       
test('Challenge Five', async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/checkboxes');
    await expect(page).toHaveTitle('Checkboxes');
    
    const checkBox1 = page.getByRole('checkbox').first();
    await expect(checkBox1).not.toBeChecked();

    const checkbox2 = page.getByRole('checkbox').nth(1);
    await expect(checkbox2).toBeChecked();

    await checkBox1.click();
    await checkbox2.click();

    await expect(checkBox1).toBeChecked();
    await expect(checkbox2).not.toBeChecked();
});

test('Challenge One', async ( {page} ) => {
    await page.goto('https://Wikipedia.org');
    await expect(page).toHaveTitle(/Wikipedia/);
    
    const searchBox = page.getByRole('searchbox', { name: 'Search Wikipedia'});
    await expect(searchBox).toBeVisible();
    console.log('Successful!');
});

test('Challenge One without variables', async({page}) => {
    await page.goto('https://Wikipedia.org');
    await expect(page).toHaveTitle(/Wikipedia/);
    await expect(page.getByRole('searchbox', {name: 'Search Wikipedia'})).toBeVisible();
    console.log('Successful!');
});

test('Challenge Two', async({page}) => {
    await page.goto('https://the-internet.herokuapp.com/forgot_password');
    await expect(page).toHaveTitle('Forgot Password');
    
    const emailField = page.getByRole('textbox', {name: 'E-mail'});
    await emailField.fill('test@example.com');

    const retrievePassword = page.getByRole('button', { name: 'Retrieve password'});
    await retrievePassword.click();

    await expect(page.getByText("Your e-mail's been sent!")).toBeVisible();
    await expect(page).toHaveURL(/\/sent/);
});

test('Challenge Two', async({page}) => {
    await page.goto('https://the-internet.herokuapp.com/forgot_password');
    await expect(page).toHaveTitle('Forgot Password');

    await page.getByRole('textbox', {name: 'E-mail'}).fill('test@example.com');
    await page.getByRole('button', {name: 'Retrieve password'}).click();

    console.log('Success!');
    await expect(page).toHaveURL(/\/sent/);
});

test('Challenge Three', async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/login');
    await expect(page).toHaveTitle('Login');

    await page.getByRole('textbox', {name: 'Username'}).fill('tomsmith');
    await page.getByRole('textbox', {name: 'Password'}).fill('SuperSecretPassword!');
    await page.getByRole('button', {name: 'Login'}).click();
    
    await expect(page.getByText('You logged into a secure area!')).toBeVisible();
    await expect(page).toHaveURL(/\/secure/)
    console.log('Success!');
});


//Challenge Four
test.beforeAll(async() => {
    console.log('Set up test suite');
});

test.beforeEach(async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/login');
})

test('Successful Login', async( {page} ) => {
    await page.getByRole('textbox', { name: 'Username'}).fill('tomsmith');
    await page.getByRole('textbox', { name: 'Password'}).fill('SuperSecretPassword!');
    await page.getByRole('button', { name: 'Login'}).click();
    
    await expect(page.getByText(/You have logged into a secure area!/)).toBeVisible();
});

test('Failed Login', async( {page} ) => {
    await page.getByRole('textbox', { name: 'Username'}).fill('InvalidUsername');
    await page.getByRole('textbox', { name: 'Password'}).fill('InvalidPassword');
    await page.getByRole('button', { name: 'Login'}).click();
    
    await expect(page.getByText(/Failed!/)).toBeVisible();
});

test.afterEach(async( {page}, testInfo ) => {
    await page.screenshot({
        path: `failure-${testInfo.title}.png`,
        fullPage: true
    })
})

test.afterAll(async() => {
    console.log('Cleaning up test suite');
});

test('Challenge Five', async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/checkboxes');
    await expect(page).toHaveTitle('Checkboxes');

    const checkBox1 = page.getByRole('checkbox').nth(0);
    const checkBox2 = page.getByRole('checkbox').nth(1);

    await expect(checkBox1).not.toBeChecked();
    await expect(checkBox2).toBeChecked();

    await checkBox1.click();
    await checkBox2.click();

    await expect(checkBox1).toBeChecked();
    await expect(checkBox2).not.toBeChecked();
});

test('Challenge Six', async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/dropdown');
    const dropdown1 = page.getByRole('combobox');

    await dropdown1.selectOption( {value: 'Option 1'});
    await expect(dropdown1).toHaveValue('1');

    await dropdown1.selectOption( {value: 'Option 2'} );
    await expect(dropdown1).toHaveValue('2');
})

test('Sports Reference Search Player', async( {page} ) => {

    const baseURL = 'https://www.basketball-reference.com/';
    await page.goto(baseURL);
    await expect(page.getByText(/Basketball Stats and History/)).toBeVisible();
    await page.getByRole('searchbox', { name: 'Enter a player, team or section name'}).fill('Jaden Ivey');
    await page.getByText('Jaden Ivey').click();
    await expect(page.getByText('Jaden Edward Dhananjay Ivey')).toBeVisible();
    await expect(page).toHaveURL(/iveyja01.html/);
});

test('Challenge eight', async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/status_codes');
    await expect(page).toHaveTitle('The Internet');
    
    try {
        await expect(page.getByText('200')).toBeVisible();
        await page.getByText('200').click();
        console.log('200 page loaded successfully');
    } catch (error) {
        console.log('Failed to load 200 page');
    }

    const count = await page.getByText('200').count();

    if (count > 0) {
        console.log('200 page laoded successfully');
    } else {
        console.log('Failed to load 200 page');
    }

    await page.goBack();

    try {
        await page.getByText('500').click();
        console.log('500 page loaded successfully');
    } catch (error) {
        console.log('Failed to load 500 page');
    }
});

test('Challenge Nine', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/upload');
    
    // Most reliable for file inputs
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Test content')
    });
    
    // Use getByRole for the upload button
    await page.getByRole('button', { name: 'Upload' }).click();
  });


test('Challenge eleven', async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/windows');
    await expect(page).toHaveTitle(/Opening a new window/);
    const newPageListener = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Click Here' }).click();
    const newPage = await newPageListener;
    await expect(newPage).toHaveTitle(/New Window/);
    await expect(newPage.getByText(/New Window/)).toBeVisible();
    await newPage.close();
});

test('Challenge Twelve', async( {page} ) => {
    await page.goto('https://the-internet.herokuapp.com/hovers');
    await expect(page).toHaveTitle(/Hovers/);
    await page.getByRole('image', { name: 'User Avatar'}).nth(0).hover();
    await expect(page.getByText('name: user1')).toBeVisible();
    await page.getByRole('link', { name: 'view profile'}).nth(0).click();
    await expect(page).toHaveURL(/\/users\/1/);
    await page.goBack();

    await page.getByRole('image', { name: 'User Avatar'}).nth(1).hover();
    await expect(page.getByText('name: user2')).toBeVisible();
    await page.getByRole('link', { name: 'view profile'}).nth(1).click();
    await expect(page).toHaveURL(/\/users\/2/);
    await page.close();
});

test('Challenge One - New', async( {page} ) => {
    const websites = [
        { url: 'https://google.com', keyword: 'Google', searchRole: 'searchbox' },
        { url: 'https://github.com', keyword: 'Github', searchRole: 'searchbox' },
        { url: 'https://wikipedia.org', keyword: 'Wikipedia', searchRole: 'searchbox' }
    ];

    for (const site of websites) {
        await page.goto(site.url);
        await expect(page).toHaveTitle(new RegExp(site.keyword));
        await expect(page.getByRole(site.searchRole)).toBeVisible();
        console.log(`Successfully navigate to ${site.url}`);
    }
});

test('Array Challenge', async({ page }) => {
    const websites = [
        { url: 'https://google.com', searchTerm: 'Playwright testing', expectedResults: 'Playwright', searchButton: 'button' },
        { url: 'https://github.com', searchTerm: 'microsoft/playwright', expectedResults: 'Playwright', searchButton: 'button' },
        { url: 'https://wikipedia.org', searchTerm: 'JavaScript', expectedResults: 'JavaScript', searchButton: 'button' }
    ];

    for (const sites of websites) {
        await page.goto(sites.url);
        console.log(`Testing search on: ${sites.url}`);
        console.log(`Searching for: ${sites.searchTerm}`);

        await page.getByRole('searchbox').fill(sites.searchTerm);
        await page.getByRole(sites.searchButton).click();
        await expect(page.getByText(sites.expectedResults)).toBeVisible();

        console.log(`Success! Found "${sites.expectedResults}" in results`);
    }
    
    // Summary
    console.log(`\nTotal searches performed: ${websites.length}`);
    const searchTerms = websites.map(site => site.searchTerm);
    console.log(`Search terms used: ${searchTerms.join(', ')}`);
});

test('Another Array Challenge', async({ page }) => {
    const loginCreds = [
        { username: 'tomsmith', password: 'SuperSecretPassword!' },
        { username: 'wronguser', password: 'SuperSecretPassword!' },
        { username: 'tomsmith', password: 'wrongpass' },
        { username: '', password: 'SuperSecretPassword!' },
        { username: 'tomsmith', password: '' }
    ];

    // ✅ Variables OUTSIDE loop (before it starts)
    let total = 0;
    let passed = 0;
    let failed = 0;

    for (const creds of loginCreds) {
        await page.goto('https://the-internet.herokuapp.com/login');

        await page.getByRole('textbox', { name: 'Username' }).fill(creds.username);
        await page.getByRole('textbox', { name: 'Password' }).fill(creds.password);
        await page.getByRole('button', { name: 'Login' }).click();

        // ✅ Try-catch INSIDE loop (runs for each test)
        total += 1;
        
        try {
            await expect(page.getByText('You logged into a secure area!')).toBeVisible();
            passed += 1;
            console.log(`✅ Test ${total}: Login succeeded`);
            
            // Logout for next test
            await page.getByRole('link', { name: 'Logout' }).click();
        } catch {
            failed += 1;
            console.log(`❌ Test ${total}: Login failed`);
        }
    } // ✅ Loop ends here

    // ✅ Summary AFTER all loops finish
    console.log(`\nTests ran: ${total}`);
    console.log(`Passed: ${passed}, Failed: ${failed}`);
});