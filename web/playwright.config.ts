import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	outputDir: './test-results',
	fullyParallel: false,
	retries: 0,
	workers: 1,
	reporter: 'list',
	use: {
		baseURL: 'http://localhost:4321',
		browserName: 'chromium',
		viewport: { width: 393, height: 852 },
		deviceScaleFactor: 3,
		isMobile: true,
		hasTouch: true,
		screenshot: 'only-on-failure',
	},
	webServer: {
		command: 'bun run dev',
		port: 4321,
		reuseExistingServer: true,
		timeout: 30000,
	},
});
