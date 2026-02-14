import { expect, test } from "@playwright/test";

test.describe("Math Facts Quiz", () => {
	test("page loads with correct title", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle("Math Facts Quiz");
	});

	test("navigation links are visible", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("link", { name: "Quiz" })).toBeVisible();
		await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
		await expect(page.getByRole("link", { name: "Stats" })).toBeVisible();
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

	test("navigation switches to Settings view", async ({ page }) => {
		await page.goto("/");
		await page.getByRole("link", { name: "Settings" }).click();
		await expect(page.locator("#config-view")).toBeVisible();
		await expect(page.locator("#quiz-view")).toBeHidden();
	});

	test("navigation switches to Stats view", async ({ page }) => {
		await page.goto("/");
		await page.getByRole("link", { name: "Stats" }).click();
		await expect(page.locator("#stats-view")).toBeVisible();
		await expect(page.locator("#quiz-view")).toBeHidden();
	});

	test("Settings view shows table checkboxes, format checkboxes, and new items input", async ({
		page,
	}) => {
		await page.goto("/");
		await page.getByRole("link", { name: "Settings" }).click();
		const tableCheckboxes = page.locator("#table-checkboxes input");
		await expect(tableCheckboxes).toHaveCount(10);
		const formatCheckboxes = page.locator("#format-checkboxes input");
		expect(await formatCheckboxes.count()).toBeGreaterThan(0);
		await expect(page.locator("#new-items-input")).toBeVisible();
	});

	test("can navigate back to Quiz from Settings", async ({ page }) => {
		await page.goto("/");
		await page.getByRole("link", { name: "Settings" }).click();
		await expect(page.locator("#config-view")).toBeVisible();
		await page.getByRole("link", { name: "Quiz" }).click();
		await expect(page.locator("#quiz-view")).toBeVisible();
		await expect(page.locator("#config-view")).toBeHidden();
	});
});
