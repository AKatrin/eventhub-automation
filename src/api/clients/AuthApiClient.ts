import type { APIRequestContext } from '@playwright/test';
import type { ApiResult } from '../models/api.types';
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterResponse,
} from '../models/auth.types';
import { ApiClient } from './ApiClient';

export class AuthApiClient extends ApiClient {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  /** POST /auth/login */
  login(credentials: LoginRequest): Promise<ApiResult<LoginResponse>> {
    return this.send<LoginResponse>('POST', '/auth/login', {
      data: credentials,
    });
  }

  /** POST /auth/register */
  register(credentials: LoginRequest): Promise<ApiResult<RegisterResponse>> {
    return this.send<RegisterResponse>('POST', '/auth/register', {
      data: credentials,
    });
  }

  /** GET /auth/me */
  me(token?: string): Promise<ApiResult<MeResponse>> {
    return this.send<MeResponse>('GET', '/auth/me', {
      token,
    });
  }
}
