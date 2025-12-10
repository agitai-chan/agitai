import type { WorkspaceRole, CourseRole, TeamRole } from '@/api/types';

// ==========================================
// Permission Types
// ==========================================

export type Permission =
  // Workspace
  | 'workspace:create'
  | 'workspace:edit'
  | 'workspace:delete'
  | 'workspace:invite'
  // Course
  | 'course:create'
  | 'course:edit'
  | 'course:delete'
  | 'course:invite'
  // Module
  | 'module:create'
  | 'module:edit'
  | 'module:delete'
  | 'module:reorder'
  | 'module:export'
  // Team
  | 'team:create'
  | 'team:edit'
  | 'team:delete'
  | 'team:manage-members'
  // Task
  | 'task:create'
  | 'task:edit'
  | 'task:delete'
  | 'task:move'
  // Guide
  | 'guide:edit'
  // Prompt
  | 'prompt:submit'
  | 'prompt:view-others'
  // Product
  | 'product:edit'
  | 'product:submit'
  | 'product:review';

// ==========================================
// Permission Matrix
// ==========================================

const WORKSPACE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  Owner: [
    'workspace:create',
    'workspace:edit',
    'workspace:delete',
    'workspace:invite',
    'course:create',
  ],
  Member: ['course:create'],
};

const COURSE_PERMISSIONS: Record<CourseRole, Permission[]> = {
  Manager: [
    'course:edit',
    'course:delete',
    'course:invite',
    'module:create',
    'module:edit',
    'module:delete',
    'module:reorder',
    'module:export',
    'team:create',
    'team:edit',
    'team:delete',
    'team:manage-members',
    'task:create',
    'task:edit',
    'task:delete',
    'task:move',
    'guide:edit',
    'prompt:view-others',
    'product:review',
  ],
  Expert: [
    'course:invite',
    'module:create',
    'module:edit',
    'module:reorder',
    'module:export',
    'team:create',
    'team:edit',
    'team:manage-members',
    'task:create',
    'task:edit',
    'task:move',
    'guide:edit',
    'prompt:view-others',
    'product:review',
  ],
  Participant: [
    'prompt:submit',
    'product:edit',
    'product:submit',
  ],
};

// ==========================================
// Permission Check Functions
// ==========================================

/**
 * 워크스페이스 권한 확인
 */
export function hasWorkspacePermission(
  role: WorkspaceRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return WORKSPACE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * 코스 권한 확인
 */
export function hasCoursePermission(
  role: CourseRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return COURSE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * 복합 권한 확인 (워크스페이스 + 코스)
 */
export function hasPermission(
  workspaceRole: WorkspaceRole | undefined,
  courseRole: CourseRole | undefined,
  permission: Permission
): boolean {
  return (
    hasWorkspacePermission(workspaceRole, permission) ||
    hasCoursePermission(courseRole, permission)
  );
}

// ==========================================
// Role Hierarchy
// ==========================================

const WORKSPACE_ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  Owner: 2,
  Member: 1,
};

const COURSE_ROLE_HIERARCHY: Record<CourseRole, number> = {
  Manager: 3,
  Expert: 2,
  Participant: 1,
};

/**
 * 워크스페이스 역할 비교
 */
export function isWorkspaceRoleHigherOrEqual(
  userRole: WorkspaceRole,
  requiredRole: WorkspaceRole
): boolean {
  return WORKSPACE_ROLE_HIERARCHY[userRole] >= WORKSPACE_ROLE_HIERARCHY[requiredRole];
}

/**
 * 코스 역할 비교
 */
export function isCourseRoleHigherOrEqual(
  userRole: CourseRole,
  requiredRole: CourseRole
): boolean {
  return COURSE_ROLE_HIERARCHY[userRole] >= COURSE_ROLE_HIERARCHY[requiredRole];
}

// ==========================================
// Team Role Utils
// ==========================================

export const TEAM_ROLES: TeamRole[] = ['CEO', 'CPO', 'CMO', 'COO', 'CTO', 'CFO'];

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  CEO: 'CEO (대표)',
  CPO: 'CPO (기획)',
  CMO: 'CMO (마케팅)',
  COO: 'COO (운영)',
  CTO: 'CTO (기술)',
  CFO: 'CFO (재무)',
};

export const TEAM_ROLE_COLORS: Record<TeamRole, string> = {
  CEO: 'bg-purple-100 text-purple-800',
  CPO: 'bg-blue-100 text-blue-800',
  CMO: 'bg-pink-100 text-pink-800',
  COO: 'bg-green-100 text-green-800',
  CTO: 'bg-orange-100 text-orange-800',
  CFO: 'bg-teal-100 text-teal-800',
};
