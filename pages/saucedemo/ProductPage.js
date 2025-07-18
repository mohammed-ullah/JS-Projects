const { expect } = require("@playwright/test");

class productPage {
  constructor(page) {
    this.page = page;

    //locators
    this.sortDropdown = page.locator(".product_sort_container");

    // Define product names once
    const BACKPACK = "Sauce Labs Backpack";
    const BIKE_LIGHT = "Sauce Labs Bike Light";
    const TSHIRT = "Sauce Labs Bolt T-Shirt";
    const FLEECE = "Sauce Labs Fleece Jacket";
    const ONESIE = "Sauce Labs Onesie";
    const REDTSHIRT = "Test.allTheThings() T-Shirt (Red)";

    // Helper function to create product object
    const createProduct = (productName) => {
      const container = page
        .locator(".inventory_item")
        .filter({ hasText: productName });
      return {
        container: container,
        name: container.locator(".inventory_item_name"),
        price: container.locator(".inventory_item_price"),
        button: container.locator("button"),
      };
    };

    this.products = {
      backpack: createProduct(BACKPACK),
      bikeLight: createProduct(BIKE_LIGHT),
      tshirt: createProduct(TSHIRT),
      fleece: createProduct(FLEECE),
      onesie: createProduct(ONESIE),
      redShirt: createProduct(REDTSHIRT),
    };
  }

  async AZSort() {
    await this.sortDropdown.selectOption("az");
    const BACKPACK = "Sauce Labs Backpack";
    await expect(
      this.page.locator(".inventory_item_name").first()
    ).toContainText(BACKPACK);
  }

  async ZASort() {
    await this.sortDropdown.selectOption("za");
    const REDTSHIRT = "Test.allTheThings() T-Shirt (Red)";
    await expect(
      this.page.locator(".inventory_item_name").first()
    ).toContainText(REDTSHIRT);
  }

  async lohiSort() {
    await this.sortDropdown.selectOption("lohi");
    const ONESIE = "Sauce Labs Onesie";
    await expect(
      this.page.locator(".inventory_item_name").first()
    ).toContainText(ONESIE);
  }

  async hiloSort() {
    await this.sortDropdown.selectOption("hilo");
    const FLEECE = "Sauce Labs Fleece Jacket";
    await expect(
      this.page.locator(".inventory_item_name").first()
    ).toContainText(FLEECE);
  }
}

module.exports = productPage;
