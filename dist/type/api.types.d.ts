export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any[];
}
export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: any[];
}
export interface ApiSuccessResponse<T = any> {
    success: true;
    message: string;
    data?: T;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
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
//# sourceMappingURL=api.types.d.ts.map