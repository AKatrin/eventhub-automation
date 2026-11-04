import type { APIRequestContext } from '@playwright/test';
import { envConfig } from '../config/env.config';
import { logger } from '../utils/logger';
import type { ApiResult } from './models/api.types';
import type { LoginRequest, LoginResponse } from './models/auth.types';
import { AuthApiClient } from './clients/AuthApiClient';
import { BookingsApiClient } from './clients/BookingsApiClient';
import { EventsApiClient } from './clients/EventsApiClient';

/**
 * Facade that exposes every EventHub API resource through a single entry point.
 * Tests can either use a specific client (`api.events.list()`) or the
 * authentication shortcut (`api.login()`), which propagates the JWT to all
 * clients.
 */
export class EventHubApi {
  readonly auth: AuthApiClient;
  readonly events: EventsApiClient;
  readonly bookings: BookingsApiClient;

  constructor(
    request: APIRequestContext,
    baseUrl: string = envConfig.apiBaseUrl,
  ) {
    this.auth = new AuthApiClient(request, baseUrl);
    this.events = new EventsApiClient(request, baseUrl);
    this.bookings = new BookingsApiClient(request, baseUrl);
  }

  /** Authenticates and stores the JWT so subsequent calls are authorized. */
  async login(credentials: LoginRequest): Promise<ApiResult<LoginResponse>> {
    const result = await this.auth.login(credentials);

    if (result.body.success) {
      this.setToken(result.body.token);
      logger.info('API login successful; JWT applied to all clients', {
        email: result.body.user.email,
      });
    }

    return result;
  }

  setToken(token: string | undefined): void {
    this.auth.setToken(token);
    this.events.setToken(token);
    this.bookings.setToken(token);
  }

  get token(): string | undefined {
    return this.auth.token;
  }
}
