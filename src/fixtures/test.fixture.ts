import { test as base, expect } from '@playwright/test';
import { EventHubApi } from '../api/EventHubApi';
import { envConfig } from '../config/env.config';
import { createLogCapture, logger, type LogCapture, type Logger } from '../utils/logger';

interface TestFixtures {
  /** Winston logger instance (same singleton used by the API clients). */
  logger: Logger;
  /** In-memory log capture attached to the HTML/Allure report. */
  logCapture: LogCapture;
  /** Authentication-agnostic API facade backed by a dedicated request context. */
  api: EventHubApi;
}

export const test = base.extend<TestFixtures>({
  logger: async ({}, use) => {
    await use(logger);
  },

  logCapture: [
    async ({}, use, testInfo) => {
      const startedAt = Date.now();
      const capture = createLogCapture();

      logger.add(capture.transport);
      logger.info(`TEST START | ${testInfo.title}`, {
        project: testInfo.project.name,
        file: testInfo.file,
      });

      await use(capture);

      logger.info(`TEST END   | ${testInfo.title}`, {
        status: testInfo.status,
        expectedStatus: testInfo.expectedStatus,
        durationMs: Date.now() - startedAt,
      });
      logger.remove(capture.transport);

      await testInfo.attach('execution-log', {
        body: capture.getLines().join('\n'),
        contentType: 'text/plain',
      });
    },
    { auto: true },
  ],

  api: async ({ playwright }, use) => {
    const requestContext = await playwright.request.newContext({
      baseURL: envConfig.apiBaseUrl,
      extraHTTPHeaders: {
        Accept: 'application/json',
      },
      ignoreHTTPSErrors: true,
      timeout: envConfig.apiTimeoutMs,
    });

    const api = new EventHubApi(requestContext, envConfig.apiBaseUrl);
    logger.info('API request context created', { baseUrl: envConfig.apiBaseUrl });

    await use(api);

    await requestContext.dispose();
    logger.info('API request context disposed');
  },
});

export { expect };
