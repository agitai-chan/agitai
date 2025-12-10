// ==========================================
// Common Types
// ==========================================

export interface Pagination {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
}

export interface ErrorResponse {
  error_code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationErrorResponse {
  error_code: string;
  message: string;
  field_errors: Array<{
    field: string;
    message: string;
  }>;
}

export interface MessageResponse {
  message: string;
}

export interface InviteLinkResponse {
  invite_url: string;
  expires_at: string;
  max_uses: number;
}

// ==========================================
// Enums
// ==========================================

export type TaskStatus = 'Todo' | 'Doing' | 'Review' | 'Done';

export type WorkspaceRole = 'Owner' | 'Member';

export type CourseRole = 'Manager' | 'Expert' | 'Participant';

export type TeamRole = 'CEO' | 'CPO' | 'CMO' | 'COO' | 'CTO' | 'CFO';

export type TabType = 'guide' | 'prompt' | 'product';

export type ReviewAction = 'approve' | 'reject' | 'request_revision';

export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3';

// ==========================================
// API Response Wrapper
// ==========================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
