const { test, expect } = require("@playwright/test");
const LoginPage = require("../../../pages/saucedemo/LoginPage.js");

test.describe("Sauce Demo - Login Tests", () => {
  let loginPageInstance;

  test.beforeEach(async ({ page }) => {
    loginPageInstance = new LoginPage(page);
    await loginPageInstance.navigate();
  });

  test("Sauce Demo - Successful Demo", async ({ page }) => {
    await loginPageInstance.loginAsStandardUser();
    await loginPageInstance.expectLoginSuccess();
    console.log("Successfully logged in!");
  });

  test("Sauce Demo - Incorrect Password - Unsuccessful Login", async ({
    page,
  }) => {
    await loginPageInstance.login("standard_user", "incorrectPassword");
    await loginPageInstance.expectLoginError();
    console.log("Verified incorrect password doesn't log user in");
  });

  test("Sauce Demo - Incorrect Username - Unsuccessful Login", async ({
    page,
  }) => {
    await loginPageInstance.login("incorrect_user", "secret_sauce");
    await loginPageInstance.expectLoginError();
    console.log("Verified incorrect username doesn't log user in");
  });

  test("Sauce Demo - Empty Fields", async ({ page }) => {
    await loginPageInstance.login("", "");
    await loginPageInstance.expectLoginError();
    console.log("Verified error message for empty fields");
  });
});
