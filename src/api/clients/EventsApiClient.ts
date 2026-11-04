import type { APIRequestContext } from '@playwright/test';
import type { ApiResult } from '../models/api.types';
import type {
  EventDeleteResponse,
  EventListParams,
  EventListResponse,
  EventPayload,
  EventResponse,
} from '../models/event.types';
import { ApiClient } from './ApiClient';

export class EventsApiClient extends ApiClient {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  /** GET /events */
  list(params: EventListParams = {}): Promise<ApiResult<EventListResponse>> {
    return this.send<EventListResponse>('GET', '/events', {
      params,
    });
  }

  /** GET /events/:id */
  getById(eventId: number): Promise<ApiResult<EventResponse>> {
    return this.send<EventResponse>('GET', `/events/${eventId}`);
  }

  /** POST /events (admin) */
  create(payload: EventPayload): Promise<ApiResult<EventResponse>> {
    return this.send<EventResponse>('POST', '/events', { data: payload });
  }

  /** PUT /events/:id (admin) */
  update(eventId: number, payload: Partial<EventPayload>): Promise<ApiResult<EventResponse>> {
    return this.send<EventResponse>('PUT', `/events/${eventId}`, { data: payload });
  }

  /** DELETE /events/:id (admin) */
  delete(eventId: number): Promise<ApiResult<EventDeleteResponse>> {
    return this.send<EventDeleteResponse>('DELETE', `/events/${eventId}`);
  }
}
