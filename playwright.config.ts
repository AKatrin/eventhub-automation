import { defineConfig, type ReporterDescription } from '@playwright/test';
import { envConfig } from './src/config/env.config';

const isCI = Boolean(process.env.CI);

/**
 * Reporters:
 *  - list: immediate terminal feedback.
 *  - html: self-contained Playwright report with screenshots, videos, traces and
 *          the execution log attached by the custom fixture.
 *  - allure: machine-readable results for `npm run report:allure`.
 */
const reporters: ReporterDescription[] = [
  ['list'],
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
  [
    'allure-playwright',
    {
      resultsDir: 'allure-results',
      detail: true,
      suiteTitle: false,
      environmentInfo: {
        framework: 'Playwright',
        testEnvironment: envConfig.testEnvironment,
        baseUrl: envConfig.baseUrl,
        apiBaseUrl: envConfig.apiBaseUrl,
        nodeVersion: process.version,
      },
    },
  ],
];

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  globalSetup: './src/config/global-setup.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: reporters,
  use: {
    baseURL: envConfig.baseUrl,
    testIdAttribute: 'data-testid',
    ignoreHTTPSErrors: true,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'en-US',
    timezoneId: 'UTC',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: envConfig.apiBaseUrl,
      },
    },
  ],
});
