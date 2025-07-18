const { test, expect } = require("@playwright/test");
const LoginPage = require("../../../pages/saucedemo/LoginPage");
const ProductPage = require("../../../pages/saucedemo/ProductPage");

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.loginAsStandardUser();

  await expect(page).toHaveURL(/\/inventory.html/);
});

test("Verify products landing page", async ({ page }) => {
  const productCount = await page.locator(".inventory_item").count();
  expect(productCount).toBeGreaterThan(0);
});

test("Add Products to cart and remove one", async ({ page }) => {
  const productPage = new ProductPage(page);
  const cartBadge = page.locator(".fa-layers-counter.shopping_cart_badge");

  // Add first product (Sauce Labs Backpack)
  await productPage.products.backpack.button.click();
  await expect(cartBadge).toBeVisible();
  await expect(cartBadge).toContainText("1");

  // Add second product (Sauce Labs Bike Light)
  await productPage.products.bikeLight.button.click();
  await expect(cartBadge).toContainText("2");

  // Remove first product (button now says "Remove")
  await productPage.products.backpack.button.click();
  await expect(cartBadge).toContainText("1");

  console.log("✅ Successfully added 2 products and removed 1");
});

test("Sorting by name descending ", async ({ page }) => {
  const productPage = new ProductPage(page);
  await productPage.ZASort();
});

test("Sorting by price descending ", async ({ page }) => {
  const productPage = new ProductPage(page);
  await productPage.hiloSort();
});

test("Sorting by price ascending ", async ({ page }) => {
  const productPage = new ProductPage(page);
  await productPage.lohiSort();
});
