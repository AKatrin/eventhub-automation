export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/** Standard error envelope returned by the EventHub API. */
export interface ApiFailure {
  success: false;
  error: string;
  details?: ValidationErrorDetail[];
}

/** Standard success envelope. The payload fields are merged with `success`. */
export type ApiSuccess<T extends Record<string, unknown>> = { success: true } & T;

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResult<T> {
  status: number;
  ok: boolean;
  body: T;
  headers: Record<string, string>;
  durationMs: number;
  method: HttpMethod;
  url: string;
}
