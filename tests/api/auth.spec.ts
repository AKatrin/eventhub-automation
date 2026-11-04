import { expected, users } from '../../src/data/test-data';
import { expect, test } from '../../src/fixtures/test.fixture';
import { attachJson } from '../../src/utils/evidence';

test.describe('EventHub API | Authentication', () => {
  test('@smoke POST /auth/login returns a valid JWT and user profile', async ({
    api,
    logger,
  }, testInfo) => {
    const loginResponse = await api.auth.login(users.valid);

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);

    if (!loginResponse.body.success) {
      throw new Error(`Login failed: ${loginResponse.body.error}`);
    }

    expect(loginResponse.body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(loginResponse.body.user.email).toBe(users.valid.email);
    expect(loginResponse.durationMs).toBeLessThan(10_000);

    logger.info('API login response validated', {
      email: loginResponse.body.user.email,
      durationMs: loginResponse.durationMs,
    });

    const meResponse = await api.auth.me(loginResponse.body.token);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.success).toBe(true);

    if (!meResponse.body.success) {
      throw new Error(`GET /auth/me failed: ${meResponse.body.error}`);
    }

    expect(meResponse.body.user.email).toBe(users.valid.email);

    await attachJson(testInfo, 'login-response', loginResponse.body);
    await attachJson(testInfo, 'auth-me-response', meResponse.body);
  });

  test('POST /auth/login rejects an invalid password with HTTP 400', async ({ api, logger }) => {
    const loginResponse = await api.auth.login(users.invalidPassword);

    expect(loginResponse.status).toBe(400);
    expect(loginResponse.body.success).toBe(false);

    if (loginResponse.body.success) {
      throw new Error('The API unexpectedly accepted invalid credentials.');
    }

    expect(loginResponse.body.error).toBe(expected.api.invalidCredentialsMessage);

    logger.warn('Invalid credentials correctly rejected by the API', {
      status: loginResponse.status,
      error: loginResponse.body.error,
    });
  });

  test('GET /auth/me without a JWT returns HTTP 401', async ({ api }) => {
    const meResponse = await api.auth.me();

    expect(meResponse.status).toBe(401);
    expect(meResponse.body.success).toBe(false);

    if (meResponse.body.success) {
      throw new Error('The API unexpectedly authorized an anonymous request.');
    }

    expect(meResponse.body.error).toBe(expected.api.unauthorizedMessage);
  });
});
