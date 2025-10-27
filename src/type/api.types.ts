// Generic API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// API error response interface
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: any[];
}

// API success response interface
export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Paginated response interface
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
