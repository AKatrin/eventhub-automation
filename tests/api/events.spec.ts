import { apiTestData, users } from '../../src/data/test-data';
import { expect, test } from '../../src/fixtures/test.fixture';
import { attachJson } from '../../src/utils/evidence';

test.describe('EventHub API | Events', () => {
  test('@smoke GET /events returns events for an authenticated session', async ({
    api,
    logger,
  }, testInfo) => {
    const loginResponse = await api.login(users.valid);

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);

    const eventsResponse = await api.events.list({ limit: apiTestData.eventsPageSize });

    expect(eventsResponse.status).toBe(200);
    expect(eventsResponse.body.success).toBe(true);

    if (!eventsResponse.body.success) {
      throw new Error(`GET /events failed: ${eventsResponse.body.error}`);
    }

    expect(Array.isArray(eventsResponse.body.data)).toBe(true);
    expect(eventsResponse.body.data.length).toBeGreaterThan(0);

    for (const event of eventsResponse.body.data) {
      expect(event.id).toBeGreaterThan(0);
      expect(event.title.length).toBeGreaterThan(0);
      expect(event.availableSeats).toBeGreaterThanOrEqual(0);
      expect(event.availableSeats).toBeLessThanOrEqual(event.totalSeats);
    }

    logger.info('Events returned by the API', {
      count: eventsResponse.body.data.length,
      firstEvent: eventsResponse.body.data[0]?.title,
    });

    await attachJson(testInfo, 'events-response', eventsResponse.body);
  });
});
