import { expect, test } from "@playwright/test";

test.describe("Math Facts Quiz", () => {
	test("page loads with correct title", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle("Math Facts Quiz");
	});

	test("hamburger menu launches alternate views", async ({ page }) => {
		await page.goto("/");

		const hamburger = page.locator("#hamburger-menu");
		await expect(hamburger).toBeVisible();
		await hamburger.click();

		await expect(page.locator("#alt-views")).toBeVisible();
		await expect(page.locator("#quiz-view")).toBeHidden();

		await expect(page.locator("#config-details")).toBeVisible();
		await expect(page.locator("#stats-details")).toBeVisible();
	});

	test("quiz prompt displays with input and submit button", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator("#quiz-prompt")).toBeVisible();
		await expect(page.locator("#quiz-answer")).toBeVisible();
		await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
	});

	test("can type answer and submit to get feedback", async ({ page }) => {
		await page.goto("/");
		await page.locator("#quiz-answer").fill("5");
		await page.getByRole("button", { name: "Submit" }).click();
		await expect(page.locator("#quiz-feedback")).toBeVisible();
		await expect(page.locator("#quiz-feedback")).toHaveText(
			/Correct!|Incorrect\./,
		);
	});

	test("Settings are open by default in alternate views", async ({ page }) => {
		await page.goto("/");
		await page.locator("#hamburger-menu").click();

		const settingsDetails = page.locator("#config-details");
		await expect(settingsDetails).toHaveAttribute("open", "");

		const tableCheckboxes = page.locator("#table-checkboxes input");
		await expect(tableCheckboxes).toHaveCount(10);
	});

	test("Stats are closed by default in alternate views", async ({ page }) => {
		await page.goto("/");
		await page.locator("#hamburger-menu").click();

		const statsDetails = page.locator("#stats-details");
		await expect(statsDetails).not.toHaveAttribute("open", "");

		// Open it
		await statsDetails.locator("summary").click();
		await expect(statsDetails).toHaveAttribute("open", "");
	});

	test("can navigate back to Quiz from alternate views", async ({ page }) => {
		await page.goto("/");
		await page.locator("#hamburger-menu").click();
		await expect(page.locator("#alt-views")).toBeVisible();

		await page.locator("#close-alt-views").click();
		await expect(page.locator("#quiz-view")).toBeVisible();
		await expect(page.locator("#alt-views")).toBeHidden();
	});

	test("clicking hamburger again while in alternate views toggles back to quiz", async ({
		page,
	}) => {
		await page.goto("/");
		const hamburger = page.locator("#hamburger-menu");

		// Open alt views
		await hamburger.click();
		await expect(page.locator("#alt-views")).toBeVisible();

		// Click again to close
		await hamburger.click();
		await expect(page.locator("#quiz-view")).toBeVisible();
		await expect(page.locator("#alt-views")).toBeHidden();
	});

	test("quiz shows 5 format checkboxes in settings", async ({ page }) => {
		await page.goto("/");
		await page.locator("#hamburger-menu").click();

		const formatCheckboxes = page.locator("#format-checkboxes label");
		await expect(formatCheckboxes).toHaveCount(5);
	});

	test("reset to defaults restores all tables and formats", async ({
		page,
	}) => {
		await page.goto("/");
		await page.locator("#hamburger-menu").click();

		// Uncheck some tables
		const tableCheckboxes = page.locator("#table-checkboxes input");
		await tableCheckboxes.nth(0).uncheck(); // table 1
		await tableCheckboxes.nth(1).uncheck(); // table 2
		await tableCheckboxes.nth(2).uncheck(); // table 3

		// Uncheck some formats
		const formatCheckboxes = page.locator("#format-checkboxes input");
		await formatCheckboxes.nth(0).uncheck();
		await formatCheckboxes.nth(1).uncheck();

		// Verify they are unchecked
		await expect(tableCheckboxes.nth(0)).not.toBeChecked();
		await expect(formatCheckboxes.nth(0)).not.toBeChecked();

		// Click reset
		await page.locator("#reset-settings").click();

		// All 9 table checkboxes should be checked (tables 2-10)
		for (let i = 1; i < 10; i++) {
			await expect(tableCheckboxes.nth(i)).toBeChecked();
		}
		// Table 1 should not be checked (not in defaults)
		await expect(tableCheckboxes.nth(0)).not.toBeChecked();

		// All 5 format checkboxes should be checked
		for (let i = 0; i < 5; i++) {
			await expect(formatCheckboxes.nth(i)).toBeChecked();
		}
	});
});
