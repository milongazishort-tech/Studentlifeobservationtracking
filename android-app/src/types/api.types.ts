/**
 * Standard API Response contracts matching api-spec.md (v1.1.0)
 */

export interface ApiStandardError {
  code: string;
  message: string;
  field?: string | null;
  timestamp: string;
  path?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiStandardError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
}
