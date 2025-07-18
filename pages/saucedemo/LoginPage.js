const { expect } = require("@playwright/test");

class LoginPage {
  constructor(page) {
    this.page = page;

    // Locators
    this.usernameInput = page.locator("#user-name");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.locator("#login-button");
    this.errorMessage = page.locator('[data-test="error"]');
  }

  // Navigate to login page
  async navigate() {
    await this.page.goto("https://www.saucedemo.com/v1/");
    await expect(this.page).toHaveTitle(/Swag Labs/i);
  }

  // Login with any username/password
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // Quick login with standard user
  async loginAsStandardUser() {
    await this.login("standard_user", "secret_sauce");
  }

  // Check if login was successful
  async expectLoginSuccess() {
    await expect(this.page).toHaveURL(/\/inventory.html/);
  }

  // Check if login failed with error
  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible();
  }
}

module.exports = LoginPage;
