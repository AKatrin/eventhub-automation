import { type Locator, type Page } from '@playwright/test';
import { expected } from '../data/test-data';
import { expect } from '../utils/assertions';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: expected.loginPage.heading });
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('#login-btn');
    this.errorToast = page.getByText(expected.api.invalidCredentialsMessage);
  }

  /** Opens the login page and waits for the form to be ready. */
  async open(): Promise<void> {
    await this.goto('/login');
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeEditable();
    this.logger.info('Login page loaded and ready');
  }

  /** Fills the form and submits it. */
  async submitCredentials(email: string, password: string): Promise<void> {
    this.logger.info('Submitting login form', { email });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
    this.logger.info('Login form submitted');
  }

  /** Asserts the API error toast shown for invalid credentials. */
  async expectInvalidCredentialsError(): Promise<void> {
    await expect(this.errorToast).toBeVisible();
    this.logger.info('Invalid credentials error displayed in the UI');
  }

  /** Asserts that the browser is still on the login page. */
  async expectStillOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login$/);
    await expect(this.heading).toBeVisible();
    this.logger.info('User remains on the login page');
  }
}
