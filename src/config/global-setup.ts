import fs from 'node:fs';
import path from 'node:path';

/**
 * Removes stale Allure artifacts before every run so the generated report only
 * contains the current execution. Playwright already cleans `test-results`.
 */
export default function globalSetup(): void {
  for (const directory of ['allure-results', 'allure-report']) {
    fs.rmSync(path.resolve(process.cwd(), directory), {
      recursive: true,
      force: true,
    });
  }
}
