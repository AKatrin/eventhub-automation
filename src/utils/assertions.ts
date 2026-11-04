import { expect as baseExpect } from '@playwright/test';

/**
 * Shared assertion instance for the BDD layer.
 *
 * Cucumber does not read the `expect.timeout` setting from
 * `playwright.config.ts`, so the UI assertions get an explicit timeout that is
 * tolerant of the EventHub demo application's cold starts.
 */
export const expect = baseExpect.configure({ timeout: 20_000 });
