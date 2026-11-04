import {
  setWorldConstructor,
  World,
  type IWorldOptions,
} from '@cucumber/cucumber';
import {
  chromium,
  devices,
  request,
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { EventHubApi } from '../../src/api/EventHubApi';
import { envConfig } from '../../src/config/env.config';
import { HomePage } from '../../src/pages/HomePage';
import { LoginPage } from '../../src/pages/LoginPage';
import {
  createLogCapture,
  logger as rootLogger,
  maskSensitiveData,
  type LogCapture,
  type Logger,
} from '../../src/utils/logger';

const isHeaded = process.env.HEADED === 'true' || process.env.PWDEBUG === '1';

/**
 * Per-scenario state shared by the Cucumber step definitions.
 *
 * A fresh browser, context and APIRequestContext are created for every scenario
 * so tokens and cookies never leak between tests.
 */
export class EventHubWorld extends World {
  readonly logger: Logger = rootLogger;

  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  apiRequest!: APIRequestContext;
  api!: EventHubApi;
  loginPage!: LoginPage;
  homePage!: HomePage;
  logCapture?: LogCapture;
  startedAt = 0;

  constructor(options: IWorldOptions) {
    super(options);
  }

  /** Boots the browser, page objects and the API facade for the scenario. */
  async initialise(): Promise<void> {
    this.startedAt = Date.now();
    this.logCapture = createLogCapture();
    rootLogger.add(this.logCapture.transport);

    this.browser = await chromium.launch({ headless: !isHeaded });
    this.context = await this.browser.newContext({
      ...devices['Desktop Chrome'],
      baseURL: envConfig.baseUrl,
      ignoreHTTPSErrors: true,
      locale: 'en-US',
      timezoneId: 'UTC',
      viewport: { width: 1440, height: 900 },
    });
    this.context.setDefaultTimeout(15_000);
    this.context.setDefaultNavigationTimeout(30_000);

    this.page = await this.context.newPage();
    this.loginPage = new LoginPage(this.page);
    this.homePage = new HomePage(this.page);

    this.apiRequest = await request.newContext({
      baseURL: envConfig.apiBaseUrl,
      extraHTTPHeaders: {
        Accept: 'application/json',
      },
      ignoreHTTPSErrors: true,
      timeout: envConfig.apiTimeoutMs,
    });
    this.api = new EventHubApi(this.apiRequest, envConfig.apiBaseUrl);

    this.logger.info('BDD browser and API context created', {
      baseUrl: envConfig.baseUrl,
      headed: isHeaded,
    });
  }

  /** Attaches a full-page screenshot to the Cucumber HTML report. */
  async attachScreenshot(name: string): Promise<void> {
    if (!this.page) {
      return;
    }

    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, { mediaType: 'image/png', fileName: `${name}.png` });
  }

  /** Attaches a JSON payload with credentials and tokens masked. */
  async attachJson(name: string, value: unknown): Promise<void> {
    this.attach(JSON.stringify(maskSensitiveData(value), null, 2), {
      mediaType: 'application/json',
      fileName: `${name}.json`,
    });
  }

  /** Releases every resource, even when the scenario failed mid-way. */
  async dispose(): Promise<void> {
    if (this.apiRequest) {
      await this.apiRequest.dispose().catch((error: unknown) => {
        this.logger.warn('Failed to dispose the API request context', { error });
      });
    }

    if (this.context) {
      await this.context.close().catch((error: unknown) => {
        this.logger.warn('Failed to close the browser context', { error });
      });
    }

    if (this.browser) {
      await this.browser.close().catch((error: unknown) => {
        this.logger.warn('Failed to close the browser', { error });
      });
    }

    this.logger.info('BDD browser and API context disposed');

    if (this.logCapture) {
      rootLogger.remove(this.logCapture.transport);
      this.logCapture = undefined;
    }
  }
}

setWorldConstructor(EventHubWorld);
