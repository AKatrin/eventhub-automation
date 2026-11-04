import type { APIRequestContext } from '@playwright/test';
import { envConfig } from '../../config/env.config';
import { logger } from '../../utils/logger';
import type { ApiResult, HttpMethod } from '../models/api.types';

export interface ApiRequestOptions {
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  headers?: Record<string, string>;
  /** Overrides the token configured on the client (useful for 401 tests). */
  token?: string;
  timeoutMs?: number;
}

/**
 * Thin wrapper around Playwright's APIRequestContext.
 *
 * Every request/response is logged through Winston, including status code,
 * duration, query params and payload. Sensitive fields are masked by the
 * logger formatter before they reach the console or the log files.
 */
export abstract class ApiClient {
  private authToken?: string;

  protected constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string = envConfig.apiBaseUrl,
  ) {}

  get token(): string | undefined {
    return this.authToken;
  }

  setToken(token: string | undefined): void {
    this.authToken = token;
  }

  protected async send<T>(
    method: HttpMethod,
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiResult<T>> {
    const url = `${this.baseUrl}${path}`;
    const token = options.token ?? this.authToken;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    };

    if (options.data !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const startedAt = Date.now();

    logger.http(`API REQUEST  ${method} ${url}`, {
      query: options.params,
      payload: options.data,
      headers: token ? { Authorization: headers.Authorization } : undefined,
    });

    try {
      const response = await this.request.fetch(url, {
        method,
        headers,
        params: options.params,
        data: options.data,
        failOnStatusCode: false,
        timeout: options.timeoutMs ?? envConfig.apiTimeoutMs,
      });

      const durationMs = Date.now() - startedAt;
      const rawBody = await response.text();
      let body: unknown;

      try {
        body = rawBody.length > 0 ? JSON.parse(rawBody) : null;
      } catch {
        body = rawBody;
      }

      const status = response.status();

      logger.http(`API RESPONSE ${method} ${url} -> ${status} (${durationMs} ms)`, {
        body,
      });

      if (!response.ok()) {
        logger.warn(`API RESPONSE ${method} ${url} returned HTTP ${status}`, {
          body,
        });
      }

      return {
        status,
        ok: response.ok(),
        body: body as T,
        headers: response.headers(),
        durationMs,
        method,
        url,
      };
    } catch (error) {
      logger.error(`API REQUEST FAILED ${method} ${url}`, { error });
      throw error;
    }
  }
}
