const { test, expect } = require("@playwright/test");
const LoginPage = require("../../../pages/saucedemo/LoginPage.js");

test.describe("Sauce Demo - Login Tests", () => {
  let LoginPage;

  test.beforeEach(async ({ page }) => {
    const LoginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test("Sauce Demo - Successful Demo", async ({ page }) => {
    await LoginPage.loginAsStandardUser();
    await LoginPage.expectLoginSuccess();
    console.log("Successfully logged in!");
  });

  test("Sauce Demo - Incorrect Password - Unsuccessful Login", async ({
    page,
  }) => {
    await LoginPage.login("standard_user", "incorrectPassword");
    await LoginPage.expectLoginError();
    console.log("Verified incorrect password doesn't log user in");
  });

  test("Sauce Demo - Incorrect Username - Unsuccessful Login", async ({
    page,
  }) => {
    await LoginPage.login("incorrect_user", "secret_sauce");
    await LoginPage.expectLoginError();
    console.log("Verified incorrect username doesn't log user in");
  });

  test("Sauce Demo - Empty Fields", async ({ page }) => {
    await LoginPage.login("", "");
    await LoginPage.expectLoginError();
    console.log("Verified error message for empty fields");
  });
});
