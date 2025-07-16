const { expect } = require("@playwright/test");

class LoginPage {
  constructor(page) {
    this.page = page;

    this.usernameInput = page.locator("#user-name");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.locator("#login-button");
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorButton = page.locator(".error-button");

    this.url = "https://www.saucedemo.com/v1/";
  }

  async navigate() {
    await this.page.goto(this.url);
    await expect(this.page).toHaveTitle(/Swag Labs/i);
  }

  async fillUsername(username) {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password) {
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async login(username, password) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async loginAsStandardUser() {
    await this.login("standard_user", "secret_sauce");
  }

  async clearErrorMessage() {
    if (await this.errorMessage.isVisible()) {
      await this.errorButton.click();
    }
  }

  async expectLoginSuccess() {
    await expect(this.page).toHaveURL(/\/inventory.html/);
  }

  async expectLoginFailure() {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.page).toHaveURL(this.url);
  }

  async expectErrorMessage(expectedText) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }

  async expectUsernameRequired() {
    await this.expectErrorMessage("Username is required");
  }

  async expectPasswordRequired() {
    await this.expectErrorMessage("Password is required");
  }

  async expectInvalidCredentials() {
    await this.expectErrorMessage("Username and password do not match");
  }

  async isLoggedIn() {
    return this.page.url().includes("/inventory.html");
  }

  async getErrorText() {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }
}

module.exports = LoginPage;
