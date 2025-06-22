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

  await page.waitForFunction(
    () => {
      const table = document.querySelector("#players_standard_batting");
      return table && table.querySelectorAll("tbody tr[data-row]").length > 0;
    },
    { timeout: 15000 }
  );

  const logo = page.locator(
    'img[alt="Baseball-Reference.com Logo & Link to home page"]'
  );
  await expect(logo).toBeVisible();
  console.log("Page loaded successfully!");

  const battingTable = page.locator("#players_standard_batting");
  await expect(battingTable).toBeVisible();
  console.log("Standard Batting table found!");

  const totalPlayerRows = await battingTable
    .locator("tbody tr[data-row]")
    .filter({
      hasNot: page.locator('th[aria-label="Player"]'),
    })
    .count();
  const initialVisibleCount = await battingTable
    .locator('tbody tr[data-row]:not([class*="hidden"])')
    .filter({ hasNot: page.locator('th[aria-label="Player"]') })
    .count();

  expect(initialVisibleCount).toBe(totalPlayerRows);

  console.log("\nInitial Results:");
  console.log(`  Total players found: ${totalPlayerRows}`);
  console.log(`  Players initially visible: ${initialVisibleCount}`);

  // Selects players by clicking rank cell (Initially tried to do based on player name, but realized this kept accidently clicking the player link and failing sequential tests. Since player rank did not it was the more reliable element to use)
  const player1 = battingTable
    .locator("tbody tr")
    .first()
    .locator('th[data-stat="ranker"]');
  const player2 = battingTable
    .locator("tbody tr")
    .nth(1)
    .locator('th[data-stat="ranker"]');

  // Verifies 2 players are selected (Verified this by noticing that when a player is highlighted their class changes to include "rowSum", so just did a count before the filter button is selected below.)
  await player1.click();
  await page.waitForTimeout(500);
  console.log("Player 1 selected!");
  await player2.click();
  await page.waitForTimeout(500);
  console.log("Player 2 selected!");

  expect(await battingTable.locator("tbody tr.rowSum").count()).toBe(2);

  let filterClicked = false;
  let lastError = null;

  // I noticed the filter button didn’t always behave consistently—sometimes it would shift or take too long to load because of ads or layout changes. So instead of relying on a single attempt, I built a retry loop that gives it up to ten attempts. I also included multiple locator options to cover different variations of how the button might appear. This should mitigate any issues with the page loading inconsistently.
  for (let i = 0; i < 10; i++) {
    try {
      const filterButton = page
        .locator('button[onclick*="sr_st_statline_rowSelect"]')
        .or(page.locator('button:has-text("Show Only Selected Rows")'))
        .or(page.locator('button:has-text("Show Only Selected")'))
        .or(page.getByRole("button", { name: /show.*selected.*rows/i }));

      await filterButton.waitFor({ state: "visible", timeout: 7000 });
      await filterButton.scrollIntoViewIfNeeded();
      await filterButton.click();
      console.log("Applying filter....");

      await page.waitForFunction(
        () => {
          const rows = document.querySelectorAll(
            '#players_standard_batting tbody tr[data-row]:not([class*="hidden"])'
          );
          return rows.length === 2;
        },
        { timeout: 7000 }
      );

      filterClicked = true;
      break;
    } catch (e) {
      lastError = e;
      try {
        await page.waitForTimeout(2500);
      } catch {
        // WebKit sometimes closes the page unexpectedly during retries; this prevents a crash if waitForTimeout runs on a closed page
      }
    }
  }

  if (!filterClicked) {
    console.error("Filter interaction failed.");
    console.error("Last error:", lastError?.message);
    throw new Error(
      "Filter button failed to apply filter after multiple attempts."
    );
  }

  // I noticed that when a player is hidden it shows class as 'hidden-iso'. Therefore, I'm counting the visible rows (those without "hidden" in their class) and separately counting the hidden rows (those with "hidden" in their class). Then I'm validating that exactly 2 players remain visible and that the number of hidden players equals the original total minus 2.s
  const afterFilterCount = await battingTable
    .locator('tbody tr[data-row]:not([class*="hidden"])')
    .filter({ hasNot: page.locator('th[aria-label="Player"]') })
    .count();

  const hiddenCount = await battingTable
    .locator('tbody tr[data-row][class*="hidden"]')
    .filter({ hasNot: page.locator('th[aria-label="Player"]') })
    .count();

  expect(afterFilterCount).toBe(2);
  expect(hiddenCount).toBe(totalPlayerRows - 2);

  console.log("\nFinal Filter Results:");
  console.log(`  Players visible: ${afterFilterCount}`);
  console.log(`  Players hidden: ${hiddenCount}`);
  console.log(
    `  Filter test passed: ${totalPlayerRows} players reduced to ${afterFilterCount}`
  );
});
