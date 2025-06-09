import { test, expect } from '@playwright/test';

const websites = [
    { url:'https://www.baseball-reference.com/', logoName:'Sports-Reference.com Logo & Link to home page'},
    { url:'https://www.pro-football-reference.com/', logoName:'Sports-Reference.com Logo & Link to home page'}
];

test('Test that the various SR websites load', async({ page }) => {
    for (const site of websites) {
        await page.goto(site.url);
        await page.waitForLoadState('networkidle');
        
        const logoSelectors = [
            page.locator(`img[alt="${site.logoName}"]`),
            page.locator(`img[alt*="Logo"][alt*="Link to home"]`),
            page.getByAltText(site.logoName)
        ];
        
        let found = false;
        for (const selector of logoSelectors) {
            try {
                await expect(selector).toBeVisible({ timeout: 3000 });
                found = true;
                break;
            } catch (e) {
                
            }
        }
        
        if (!found) {
            throw new Error(`Logo not found on ${site.url}`);
        }
    }
});