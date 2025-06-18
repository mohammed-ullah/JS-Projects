import { test, expect } from "@playwright/test";

test("Baseball Reference page navigation and filtering", async ({ page }) => {
  // Navigates to 2022 Phillies batting stats
  const baseURL =
    "https://www.baseball-reference.com/teams/PHI/2022.shtml#players_standard_batting";

  console.log("Navigating to the website....");
  await page.goto(baseURL, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });

  // Waits for page to load fully
  console.log("Waiting for page to fully load...");
  const logo = page.locator(
    'img[alt="Baseball-Reference.com Logo & Link to home page"]'
  );
  await expect(logo).toBeVisible();
  console.log("Page loaded successfully!");

  // Locates the batting table and creates a variable
  const battingTable = page.locator("#players_standard_batting");
  await expect(battingTable).toBeVisible();
  console.log("Batting table found!");

  // Gets total player count (this is to create a count before hitting the filter button)
  const totalPlayerRows = await battingTable
    .locator("tbody tr[data-row]")
    .count();
  console.log(`\nInitial State:`);
  console.log(`  Total players found: ${totalPlayerRows}`);

  // Verifies all players are initially visible
  const initialVisibleCount = await battingTable
    .locator('tbody tr[data-row]:not([class*="hidden"])')
    .count();
  expect(initialVisibleCount).toBe(totalPlayerRows);
  console.log("  All players initially visible");

  // Selects first player by clicking rank cell (Initially tried to do based on player name, but realized this kept accidently clicking the player link and failing sequential tests. Since player rank did not it was the more reliable element to use)
  console.log("\nSelecting Players:");
  console.log("  Selecting first player...");
  const player1RankCell = battingTable
    .locator("tbody tr")
    .first()
    .locator('th[data-stat="ranker"]');
  await player1RankCell.click();
  await page.waitForTimeout(500);
  console.log("  First player selected");

  // Selects second player by clicking rank cell
  console.log("  Selecting second player...");
  const player2RankCell = battingTable
    .locator("tbody tr")
    .nth(1)
    .locator('th[data-stat="ranker"]');
  await player2RankCell.click();
  await page.waitForTimeout(500);
  console.log("  Second player selected");

  // Verifies 2 players are selected (Verified this by noticing that when a player is highlighted their class changes to include "rowSum", so just did a count before the filter button is selected below.)
  const selectedRows = await battingTable.locator("tbody tr.rowSum").count();
  expect(selectedRows).toBe(2);
  console.log(`  Confirmed ${selectedRows} players selected`);

  // Applies filter - Initially only had one locator for the filterbutton but realized it failed on occasion due to various factors such as ad and network load
  console.log("\nApplying Filter:");
  console.log("  Looking for filter button...");
  await page.waitForTimeout(10000);
  const filterButton = page
    .locator('button[onclick*="sr_st_statline_rowSelect"]')
    .or(page.locator('button:has-text("Show Only Selected Rows")'))
    .or(page.locator('button:has-text("Show Only Selected")'))
    .or(page.getByRole("button", { name: /show.*selected.*rows/i }));
  await filterButton.waitFor({ state: "visible", timeout: 10000 });
  await filterButton.click();
  await page.waitForTimeout(1000);
  console.log("  Filter applied successfully");

  // Verifies filter results (I noticed that when a player is hidden it shows class as 'hidden-iso'. Therefore, I'm counting the visible rows (those without "hidden" in their class) and separately counting the hidden rows (those with "hidden" in their class). Then I'm validating that exactly 2 players remain visible and that the number of hidden players equals the original total minus 2.)
  const afterFilterCount = await battingTable
    .locator('tbody tr[data-row]:not([class*="hidden"])')
    .count();
  const hiddenCount = await battingTable
    .locator('tbody tr[data-row][class*="hidden"]')
    .count();

  expect(afterFilterCount).toBe(2);
  expect(hiddenCount).toBe(totalPlayerRows - 2);

  console.log("\nFilter Results:");
  console.log(`  Players visible: ${afterFilterCount}`);
  console.log(`  Players hidden: ${hiddenCount}`);
  console.log(
    `  Filter test passed: ${totalPlayerRows} players reduced to ${afterFilterCount}`
  );
});
