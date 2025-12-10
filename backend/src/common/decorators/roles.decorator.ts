import { SetMetadata } from '@nestjs/common';

// Workspace Roles
export type WorkspaceRoleType = 'Owner' | 'Member';
export const WORKSPACE_ROLES_KEY = 'workspaceRoles';
export const RequireWorkspaceRole = (...roles: WorkspaceRoleType[]) =>
  SetMetadata(WORKSPACE_ROLES_KEY, roles);

// Course Roles
export type CourseRoleType = 'Manager' | 'Expert' | 'Participant';
export const COURSE_ROLES_KEY = 'courseRoles';
export const RequireCourseRole = (...roles: CourseRoleType[]) =>
  SetMetadata(COURSE_ROLES_KEY, roles);

// Team Roles
export type TeamRoleType = 'CEO' | 'CPO' | 'CMO' | 'COO' | 'CTO' | 'CFO';
export const TEAM_ROLES_KEY = 'teamRoles';
export const RequireTeamRole = (...roles: TeamRoleType[]) =>
  SetMetadata(TEAM_ROLES_KEY, roles);
