import type { ApiFailure, ApiSuccess } from './api.types';

export interface AuthUser {
  /** Returned by POST /auth/login. */
  id?: number;
  /** Returned by GET /auth/me. */
  userId?: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse =
  | ApiSuccess<{ token: string; user: AuthUser }>
  | ApiFailure;

export type MeResponse = ApiSuccess<{ user: AuthUser }> | ApiFailure;

export type RegisterResponse = LoginResponse;
