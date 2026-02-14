import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "src/web",
	testMatch: "*.spec.ts",
	webServer: {
		command: "bun run serve:web",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
	},
	use: {
		baseURL: "http://localhost:3000",
	},
	projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
