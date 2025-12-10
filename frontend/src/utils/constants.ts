import type { TaskStatus } from '@/api/types';

// ==========================================
// Task Status
// ==========================================

export const TASK_STATUS: Record<TaskStatus, { label: string; color: string; dotColor: string }> = {
  Todo: { label: '할 일', color: 'bg-slate-100 text-slate-600', dotColor: 'bg-slate-400' },
  Doing: { label: '진행 중', color: 'bg-blue-100 text-blue-600', dotColor: 'bg-blue-500' },
  Review: { label: '리뷰 중', color: 'bg-amber-100 text-amber-600', dotColor: 'bg-amber-500' },
  Done: { label: '완료', color: 'bg-green-100 text-green-600', dotColor: 'bg-green-500' },
};

export const TASK_STATUS_ORDER: TaskStatus[] = ['Todo', 'Doing', 'Review', 'Done'];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  Todo: '할 일',
  Doing: '진행 중',
  Review: '리뷰 중',
  Done: '완료',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  Todo: 'bg-slate-100 text-slate-600',
  Doing: 'bg-blue-100 text-blue-600',
  Review: 'bg-amber-100 text-amber-600',
  Done: 'bg-green-100 text-green-600',
};

export const TASK_STATUS_DOT_COLORS: Record<TaskStatus, string> = {
  Todo: 'bg-slate-400',
  Doing: 'bg-blue-500',
  Review: 'bg-amber-500',
  Done: 'bg-green-500',
};

// ==========================================
// Validation
// ==========================================

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NICKNAME_MIN_LENGTH: 2,
  NICKNAME_MAX_LENGTH: 20,
  BIO_MAX_LENGTH: 200,
  WORKSPACE_NAME_MAX_LENGTH: 50,
  COURSE_NAME_MAX_LENGTH: 100,
  MODULE_NAME_MAX_LENGTH: 100,
  TASK_NAME_MAX_LENGTH: 200,
  COMMENT_MAX_LENGTH: 1000,
  PROMPT_MIN_LENGTH: 10,
  PROMPT_MAX_LENGTH: 10000,
} as const;

// ==========================================
// Pagination
// ==========================================

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ==========================================
// File Upload
// ==========================================

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_ATTACHMENT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ==========================================
// AI Models
// ==========================================

export const AI_MODELS = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3', label: 'Claude 3' },
] as const;

export const DEFAULT_AI_MODEL = 'gpt-4';
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 2048;

// ==========================================
// Routes
// ==========================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PASSWORD_RESET: '/password-reset',
  DASHBOARD: '/dashboard',
  WORKSPACES: '/workspaces',
  WORKSPACE_DETAIL: (id: string) => `/workspace/${id}`,
  WORKSPACE_SETTINGS: (id: string) => `/workspace/${id}/settings`,
  COURSE_DETAIL: (workspaceId: string, courseId: string) =>
    `/workspace/${workspaceId}/course/${courseId}`,
  COURSE_SETTINGS: (workspaceId: string, courseId: string) =>
    `/workspace/${workspaceId}/course/${courseId}/settings`,
  TEAM_DETAIL: (workspaceId: string, courseId: string, teamId: string) =>
    `/workspace/${workspaceId}/course/${courseId}/team/${teamId}`,
  TASK_DETAIL: (workspaceId: string, courseId: string, moduleId: string, taskId: string) =>
    `/workspace/${workspaceId}/course/${courseId}/module/${moduleId}/task/${taskId}`,
  TEAM_TASK_DETAIL: (
    workspaceId: string,
    courseId: string,
    teamId: string,
    teamTaskId: string
  ) => `/workspace/${workspaceId}/course/${courseId}/team/${teamId}/task/${teamTaskId}`,
  PROFILE: '/profile',
} as const;

// ==========================================
// Local Storage Keys
// ==========================================

export const STORAGE_KEYS = {
  AUTH: 'agit-auth-storage',
  UI: 'agit-ui-storage',
  RECENT_WORKSPACES: 'agit-recent-workspaces',
} as const;

// ==========================================
// Team Roles
// ==========================================

export const TEAM_ROLES: Record<string, { label: string; color: string }> = {
  CEO: { label: 'CEO', color: 'bg-purple-100 text-purple-700' },
  CPO: { label: 'CPO', color: 'bg-blue-100 text-blue-700' },
  CMO: { label: 'CMO', color: 'bg-green-100 text-green-700' },
  COO: { label: 'COO', color: 'bg-orange-100 text-orange-700' },
  CTO: { label: 'CTO', color: 'bg-cyan-100 text-cyan-700' },
  CFO: { label: 'CFO', color: 'bg-rose-100 text-rose-700' },
};
