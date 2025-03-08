export interface ApiError {
  message?: string;
  errors?: string[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  errors?: string[];
  data?: Record<string, unknown>;
}
