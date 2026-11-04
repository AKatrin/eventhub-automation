import { type Locator, type Page } from '@playwright/test';
import { expected } from '../data/test-data';
import { expect } from '../utils/assertions';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly heroHeading: Locator;
  readonly featuredSection: Locator;
  readonly userEmail: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heroHeading = page.getByRole('heading', { name: new RegExp(expected.homePage.heroHeading) });
    this.featuredSection = page.getByRole('heading', { name: expected.homePage.featuredSection });
    this.userEmail = page.getByTestId('user-email-display');
    this.logoutButton = page.getByTestId('logout-btn');
  }

  /** Validates the post-login page structure (URL, hero and featured section). */
  async expectHomePage(): Promise<void> {
    await this.waitForPath('/');
    await expect(this.heroHeading).toBeVisible();
    await expect(this.featuredSection).toBeVisible();
    this.logger.info('Authenticated home page loaded');
  }

  /** Validates the authenticated header (user email and logout action). */
  async expectUserInHeader(email: string): Promise<void> {
    await expect(this.userEmail).toHaveText(email);
    await expect(this.logoutButton).toBeVisible();
    this.logger.info('Authenticated header validated', { email });
  }

  /** Validates the full post-login state: URL, hero section and header. */
  async expectLoggedIn(email: string): Promise<void> {
    await this.expectHomePage();
    await this.expectUserInHeader(email);
    this.logger.info('Authenticated home page validated', { email });
  }

  /** Logs out through the header button. */
  async logout(): Promise<void> {
    this.logger.info('Logging out through the header');
    await this.logoutButton.click();
    await this.waitForPath('/login');
    await expect(this.page.getByRole('heading', { name: expected.loginPage.heading })).toBeVisible();
    this.logger.info('Logout completed');
  }
}
