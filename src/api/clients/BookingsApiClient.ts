import type { APIRequestContext } from '@playwright/test';
import type { ApiResult } from '../models/api.types';
import type {
  BookingListParams,
  BookingListResponse,
  BookingResponse,
  CancelBookingResponse,
  CreateBookingRequest,
} from '../models/booking.types';
import { ApiClient } from './ApiClient';

export class BookingsApiClient extends ApiClient {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  /** GET /bookings */
  list(params: BookingListParams = {}): Promise<ApiResult<BookingListResponse>> {
    return this.send<BookingListResponse>('GET', '/bookings', {
      params,
    });
  }

  /** GET /bookings/:id */
  getById(bookingId: number): Promise<ApiResult<BookingResponse>> {
    return this.send<BookingResponse>('GET', `/bookings/${bookingId}`);
  }

  /** POST /bookings */
  create(payload: CreateBookingRequest): Promise<ApiResult<BookingResponse>> {
    return this.send<BookingResponse>('POST', '/bookings', { data: payload });
  }

  /** DELETE /bookings/:id */
  cancel(bookingId: number): Promise<ApiResult<CancelBookingResponse>> {
    return this.send<CancelBookingResponse>('DELETE', `/bookings/${bookingId}`);
  }
}
