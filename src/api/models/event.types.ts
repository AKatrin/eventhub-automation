import type { ApiFailure, ApiSuccess, Pagination } from './api.types';

export interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  eventDate: string;
  price: string;
  totalSeats: number;
  availableSeats: number;
  imageUrl?: string;
  isStatic?: boolean;
  userId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type EventListParams = {
  search?: string;
  category?: string;
  city?: string;
  page?: number;
  limit?: number;
};

export interface EventPayload {
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  eventDate: string;
  price: number | string;
  totalSeats: number;
  imageUrl?: string;
}

export type EventListResponse =
  | ApiSuccess<{ data: Event[]; pagination?: Pagination }>
  | ApiFailure;

export type EventResponse = ApiSuccess<{ data: Event }> | ApiFailure;

export type EventDeleteResponse =
  | ApiSuccess<{ message?: string }>
  | ApiFailure;
