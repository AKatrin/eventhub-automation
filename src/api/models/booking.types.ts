import type { ApiFailure, ApiSuccess, Pagination } from './api.types';
import type { Event } from './event.types';

export interface Booking {
  id: number;
  eventId: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
  totalPrice: string;
  status: 'confirmed' | 'cancelled' | string;
  bookingRef: string;
  createdAt: string;
  updatedAt: string;
  event?: Event;
}

export interface CreateBookingRequest {
  eventId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
}

export type BookingListParams = {
  page?: number;
  limit?: number;
};

export type BookingListResponse =
  | ApiSuccess<{ data: Booking[]; pagination: Pagination }>
  | ApiFailure;

export type BookingResponse =
  | ApiSuccess<{ data: Booking; message?: string }>
  | ApiFailure;

export type CancelBookingResponse =
  | ApiSuccess<{ message?: string }>
  | ApiFailure;
