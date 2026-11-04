import { Given, Then, When } from '@cucumber/cucumber';
import { expected, users } from '../../src/data/test-data';
import { expect } from '../../src/utils/assertions';
import type { EventHubWorld } from '../support/world';

Given('I am on the EventHub login page', async function (this: EventHubWorld) {
  await this.loginPage.open();
});

When(
  'I sign in with the configured valid credentials',
  async function (this: EventHubWorld) {
    this.logger.info('Using configured EventHub test account', {
      email: users.valid.email,
    });
    await this.loginPage.submitCredentials(users.valid.email, users.valid.password);
  },
);

When(
  'I sign in with the configured email and an invalid password',
  async function (this: EventHubWorld) {
    this.logger.warn('Attempting login with an invalid password (negative scenario)');
    await this.loginPage.submitCredentials(
      users.invalidPassword.email,
      users.invalidPassword.password,
    );
  },
);

Then('I should see the authenticated home page', async function (this: EventHubWorld) {
  await this.homePage.expectHomePage();
  await this.attachScreenshot('home-page-after-login');
});

Then(
  "the header should display the authenticated user's email",
  async function (this: EventHubWorld) {
    await this.homePage.expectUserInHeader(users.valid.email);
  },
);

Then(
  /^the JWT stored in localStorage should be valid according to GET \/auth\/me$/,
  async function (this: EventHubWorld) {
    const token = await this.page.evaluate(
      (storageKey) => window.localStorage.getItem(storageKey),
      expected.storageKeys.token,
    );

    expect(token, 'The JWT should be persisted in localStorage after login').toBeTruthy();

    const meResponse = await this.api.auth.me(token ?? undefined);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.success).toBe(true);

    if (!meResponse.body.success) {
      throw new Error(`GET /auth/me failed: ${meResponse.body.error}`);
    }

    expect(meResponse.body.user.email).toBe(users.valid.email);
    expect(meResponse.body.user.userId).toBeGreaterThan(0);

    await this.attachJson('auth-me-response', meResponse.body);
    this.logger.info('API session validation passed', {
      userId: meResponse.body.user.userId,
      email: meResponse.body.user.email,
    });
  },
);

Then('I should see the invalid credentials error', async function (this: EventHubWorld) {
  await this.loginPage.expectInvalidCredentialsError();
});

Then('I should remain on the login page', async function (this: EventHubWorld) {
  await this.loginPage.expectStillOnLoginPage();
});

Then('no JWT should be stored in localStorage', async function (this: EventHubWorld) {
  const token = await this.page.evaluate(
    (storageKey) => window.localStorage.getItem(storageKey),
    expected.storageKeys.token,
  );

  expect(token, 'No JWT should be stored for a failed login').toBeNull();
  this.logger.info('Confirmed that no JWT was persisted after the failed login');
});
