import type { Pagination, WorkspaceRole } from './common.types';

// ==========================================
// Workspace Types
// ==========================================

export interface Workspace {
  workspace_id: string;
  workspace_name: string;
  description?: string;
  workspace_color?: string;
  logo_image?: string;
  owner?: {
    user_id: string;
    nick_name: string;
  };
  member_count: number;
  course_count: number;
  user_role: WorkspaceRole;
  is_starred: boolean;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceListResponse {
  workspaces: Workspace[];
  pagination?: Pagination;
}

export interface CreateWorkspaceRequest {
  workspace_name: string;
  description?: string;
  workspace_color?: string;
  logo_image?: File;
}

export interface UpdateWorkspaceRequest {
  workspace_name?: string;
  description?: string;
  workspace_color?: string;
  logo_image?: File;
}

export interface WorkspaceSettings {
  workspace_id: string;
  workspace_name: string;
  description?: string;
  workspace_color?: string;
  logo_image?: string;
  owner: {
    user_id: string;
    nick_name: string;
    email: string;
  };
  members: WorkspaceMember[];
  created_at: string;
}

export interface WorkspaceMember {
  user_id: string;
  nick_name: string;
  email: string;
  profile_image?: string;
  role: WorkspaceRole;
  joined_at?: string;
}

export interface WorkspaceInviteRequest {
  max_uses?: number;
  expires_hours?: number;
}
