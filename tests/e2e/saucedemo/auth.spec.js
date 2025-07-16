const { test, expect } = require("@playwright/test");
const LoginPage = require("../../../pages/saucedemo/LoginPage.js");

test.describe("Sauce Demo - Login Tests", () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test("Sauce Demo - Successful Login", async ({ page }) => {
    await loginPage.loginAsStandardUser();
    await loginPage.expectLoginSuccess();

    console.log("✅ Successfully logged in!");
  });

  test("Sauce Demo - Incorrect Password - Unsuccessful Login", async ({
    page,
  }) => {
    await loginPage.login("standard_user", "incorrectPassword");
    await loginPage.expectInvalidCredentials();

    console.log("✅ Verified incorrect password doesn't log user in");
  });

  test("Sauce Demo - Incorrect Username - Unsuccessful Login", async ({
    page,
  }) => {
    await loginPage.login("incorrect_user", "secret_sauce");
    await loginPage.expectInvalidCredentials();

    console.log("✅ Verified incorrect username doesn't log user in");
  });

  test("Sauce Demo - Empty Fields", async ({ page }) => {
    await loginPage.clickLogin();
    await loginPage.expectUsernameRequired();

    console.log("✅ Verified error message for empty fields");
  });
});
