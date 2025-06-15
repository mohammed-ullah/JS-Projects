import { test, expect } from "@playwright/test";

test("Test that 2022 Philadelphia Phillies Page loads and Validate Standard Batting table ", async ({
  page,
}) => {
  //Defining Variables in this section
  const baseURL =
    "https://www.baseball-reference.com/teams/PHI/2022.shtml#players_standard_b";
  const standardBatting = page.getByRole("heading", {
    name: "Standard Batting",
  });

  console.log("Navigating to the website....");

  //Navigating to the specified URL that I defined above and verifying that the URL is correct. Added in domcontentloaded because originally it was failing with Playwright default (load)
  await page.goto(baseURL, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await expect(page).toHaveURL(/.*teams\/PHI\/2022\.shtml#players_standard_b/);

  // Give the page time to load ads and dynamic content
  console.log("Waiting for page content to stabilize...");
  await page.waitForTimeout(4000);

  console.log("Successfully navigated to the 2022 Phillies Team page!");

  await standardBatting.scrollIntoViewIfNeeded();
  expect(standardBatting).toBeVisible();
  console.log("Scrolled down to the Standard Betting table!");

  try {
    await page.waitForSelector(
      '.ad-container, iframe[src*="googlesyndication"], .google-ads',
      {
        timeout: 10000,
      }
    );
    console.log("Ads loaded");
  } catch {
    console.log("No ads detected or ads failed to load");
  }

  //Now that we verified that we are in the correct page and found the Standard Batting table We can continue to validate that the table is present and it's overall structure

  console.log("Starting table structure validaiton...");
  const battingTable = page.locator("#players_standard_batting");
  await expect(battingTable).toBeVisible();
  console.log("Verified that table is visble and accessible...");

  //Selecting a subset of the most important headers. Idealy we would want to do all but to save time I chose only a few
  const tableHeaders = [
    "Player",
    "G",
    "AB",
    "R",
    "H",
    "HR",
    "RBI",
    "BA",
    "OBP",
    "SLG",
  ];

  for (const header of tableHeaders) {
    await expect(
      battingTable.locator("thead").getByText(header, { exact: true })
    ).toBeVisible();
  }

  console.log("Verified that key heads have loaded!");

  //Next, I wanted to verify basic sorting of the tables.
  console.log("Testing table sorting...");

  // Ensure table is still in view after any ad loading
  await standardBatting.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const playerHeader = battingTable
    .getByRole("columnheader", {
      name: "Player",
    })
    .first();
  const initialHTML = await battingTable.locator("tbody").innerHTML();

  await playerHeader.click();
  await page.waitForTimeout(1000);

  const sortedHTML = await battingTable.locator("tbody").innerHTML();
  expect(sortedHTML).not.toBe(initialHTML);
  console.log("Player column sorting works");

  //Verifying that clicking 'Playoffs' tab changes the table content
  const playoffButton = page.getByRole("link", { name: "Playoffs" }).first();
  await playoffButton.click();
  console.log("Clicked Playoff button");

  const playoffHTML = await battingTable.locator("tbody").innerHTML();
  expect(playoffHTML).not.toBe(sortedlHTML);
  console.log("Verified that playoff content loaded");
});
