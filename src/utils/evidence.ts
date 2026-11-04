import type { Page, TestInfo } from '@playwright/test';
import { maskSensitiveData } from './logger';

/** Attaches a full-page screenshot to both the Playwright HTML and Allure reports. */
export async function attachScreenshot(
  testInfo: TestInfo,
  name: string,
  page: Page,
): Promise<void> {
  const screenshot = await page.screenshot({ fullPage: true });

  await testInfo.attach(name, {
    body: screenshot,
    contentType: 'image/png',
  });
}

/** Attaches a JSON payload (API response, test data, diagnostics) to the report. */
export async function attachJson(
  testInfo: TestInfo,
  name: string,
  value: unknown,
): Promise<void> {
  await testInfo.attach(name, {
    body: JSON.stringify(maskSensitiveData(value), null, 2),
    contentType: 'application/json',
  });
}

/** Attaches a plain-text artifact to the report. */
export async function attachText(
  testInfo: TestInfo,
  name: string,
  value: string,
): Promise<void> {
  await testInfo.attach(name, {
    body: value,
    contentType: 'text/plain',
  });
}
