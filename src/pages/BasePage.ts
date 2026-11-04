import { type Locator, type Page } from '@playwright/test';
import type { Logger } from 'winston';
import { expect } from '../utils/assertions';
import { logger as rootLogger } from '../utils/logger';

/**
 * Base class for all page objects. Keeps navigation, assertions and logging
 * consistent across the UI layer.
 */
export abstract class BasePage {
  protected readonly logger: Logger;

  protected constructor(
    protected readonly page: Page,
    logger: Logger = rootLogger,
  ) {
    this.logger = logger;
  }

  /** Opens a path relative to `use.baseURL`. */
  async goto(path = '/'): Promise<void> {
    this.logger.info(`UI NAVIGATE | ${path}`);
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /** Waits until the browser URL matches the provided predicate. */
  async waitForPath(path: string): Promise<void> {
    await this.page.waitForURL((url) => url.pathname === path, {
      waitUntil: 'domcontentloaded',
    });
  }

  /** Returns a full-page screenshot buffer (attached to reports by the tests). */
  async takeScreenshot(label: string): Promise<Buffer> {
    this.logger.debug(`UI SCREENSHOT | ${label}`);
    return this.page.screenshot({ fullPage: true });
  }

  /** Asserts that a locator is visible, logging the element description. */
  protected async expectVisible(locator: Locator, description: string): Promise<void> {
    this.logger.debug(`UI ASSERT VISIBLE | ${description}`);
    await expect(locator, `Expected "${description}" to be visible`).toBeVisible();
  }
}
