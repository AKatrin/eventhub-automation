import { envConfig } from '../config/env.config';

export interface UserCredentials {
  email: string;
  password: string;
}

/**
 * Test data is intentionally kept separate from the tests so the same values can
 * be reused by UI, API and future contract/performance suites.
 */
export const users = {
  valid: {
    email: envConfig.credentials.email,
    password: envConfig.credentials.password,
  },
  invalidPassword: {
    email: envConfig.credentials.email,
    password: 'WrongPass123!',
  },
  unknownEmail: {
    email: 'not-registered-eventhub@mailsac.com',
    password: 'WrongPass123!',
  },
} satisfies Record<string, UserCredentials>;

export const expected = {
  loginPage: {
    heading: 'Sign in to EventHub',
    submitButton: 'Sign In',
  },
  homePage: {
    heroHeading: 'Discover & Book',
    featuredSection: 'Featured Events',
  },
  api: {
    invalidCredentialsMessage: 'Invalid email or password',
    unauthorizedMessage: 'Unauthorized',
  },
  storageKeys: {
    token: 'eventhub_token',
  },
} as const;

export const apiTestData = {
  eventsPageSize: 5,
} as const;
