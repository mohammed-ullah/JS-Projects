const { test, expect } = require("@playwright/test");

test("Testing Filtering on Standard Batting Table", async ({ page }) => {
  test.setTimeout(120000);

  const baseURL =
    "https://www.baseball-reference.com/teams/PHI/2022.shtml#players_standard_batting";

  console.log("Navigating to the website...");
  await page.goto(baseURL, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });

  // Centralized locator definitions to avoid redundant DOM queries and improve maintainability
  const battingTable = page.locator("#players_standard_batting");
  const playerRows = battingTable.locator("tbody tr[data-row]").filter({
    hasNot: page.locator('th[aria-label="Player"]'),
  });
  const visibleRows = battingTable
    .locator('tbody tr[data-row]:not([class*="hidden"])')
    .filter({
      hasNot: page.locator('th[aria-label="Player"]'),
    });
  const selectedRows = battingTable.locator("tbody tr.rowSum");

  await page.waitForFunction(
    () => {
      const table = document.querySelector("#players_standard_batting");
      return table && table.querySelectorAll("tbody tr[data-row]").length > 0;
    },
    { timeout: 15000 }
  );

  console.log("Page loaded successfully!");

  // Used reusable locators instead of rebuilding complex selectors multiple times
  const totalPlayerRows = await playerRows.count();
  const initialVisibleCount = await visibleRows.count();

  expect(initialVisibleCount).toBe(totalPlayerRows);

  console.log("\nInitial Results:");
  console.log(`  Total players found: ${totalPlayerRows}`);
  console.log(`  Players initially visible: ${initialVisibleCount}`);

  const firstPlayerRank = playerRows.first().locator('th[data-stat="ranker"]');
  const secondPlayerRank = playerRows.nth(1).locator('th[data-stat="ranker"]');

  // Replaced timeouts with condition-based waits
  await firstPlayerRank.click();
  await expect(selectedRows).toHaveCount(1);
  console.log("Player 1 selected!");

  await secondPlayerRank.click();
  await expect(selectedRows).toHaveCount(2);
  console.log("Player 2 selected!");

  const filterButton = page
    .getByRole("button", { name: /show.*selected.*rows/i })
    .or(page.locator('button[onclick*="sr_st_statline_rowSelect"]'))
    .or(page.locator('button:has-text("Show Only Selected")'));

  let filterClicked = false;
  let lastError = null;

  for (let i = 0; i < 10; i++) {
    try {
      await expect(filterButton).toBeVisible({ timeout: 5000 });
      await filterButton.scrollIntoViewIfNeeded();

      await filterButton.click({ timeout: 5000 });
      console.log("Applying filter....");

      await expect(visibleRows).toHaveCount(2, { timeout: 5000 });

      filterClicked = true;
      break;
    } catch (e) {
      lastError = e;
      // Added attempt counter for better debugging during test failures
      console.log(`Filter attempt ${i + 1} failed, retrying...`);
      try {
        await page.waitForTimeout(1500);
      } catch {}
    }
  }

  if (!filterClicked) {
    console.error("Filter interaction failed after 5 attempts.");
    console.error("Last error:", lastError?.message);
    throw new Error(
      "Filter button failed to apply filter after multiple attempts."
    );
  }

  // I reused the locators from previous variables rather than new ones to make readability easier
  const afterFilterCount = await visibleRows.count();
  const hiddenRows = battingTable
    .locator('tbody tr[data-row][class*="hidden"]')
    .filter({
      hasNot: page.locator('th[aria-label="Player"]'),
    });
  const hiddenCount = await hiddenRows.count();

  expect(afterFilterCount).toBe(2);
  expect(hiddenCount).toBe(totalPlayerRows - 2);
  expect(afterFilterCount + hiddenCount).toBe(totalPlayerRows);

  console.log("\nFinal Filter Results:");
  console.log(`  Players visible: ${afterFilterCount}`);
  console.log(`  Players hidden: ${hiddenCount}`);
  console.log(
    `  Filter test passed: ${totalPlayerRows} players reduced to ${afterFilterCount}`
  );
});
