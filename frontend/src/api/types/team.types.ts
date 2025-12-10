import type { Pagination, TeamRole } from './common.types';

// ==========================================
// Team Types
// ==========================================

export interface Team {
  team_id: string;
  course_id: string;
  team_name: string;
  description?: string;
  member_count: number;
  progress?: {
    total_tasks: number;
    completed_tasks: number;
    percentage: number;
  };
  created_at: string;
  updated_at: string;
}

export interface TeamListResponse {
  teams: Team[];
  pagination: Pagination;
}

export interface TeamDetail extends Team {
  members: TeamMember[];
  team_tasks: TeamTaskSummary[];
}

export interface TeamMember {
  user_id: string;
  nick_name: string;
  email: string;
  profile_image?: string;
  role?: string;
  team_role?: string;
  joined_at?: string;
}

export interface TeamTaskSummary {
  team_task_id: string;
  task_id: string;
  task_name: string;
  module_name: string;
  status: string;
  updated_at: string;
}

export interface TeamTask {
  team_task_id: string;
  task_id: string;
  team_id: string;
  task_name: string;
  module_name?: string;
  team_name?: string;
  status: string;
  guide?: {
    content: string;
    attachments?: string[];
  };
  product?: {
    content: string;
    version: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateTeamRequest {
  team_name: string;
  description?: string;
  members?: Array<{
    user_id: string;
    role: TeamRole;
  }>;
}

export interface UpdateTeamRequest {
  team_name?: string;
  description?: string;
  members?: Array<{
    user_id: string;
    role: TeamRole;
    action: 'add' | 'remove' | 'update';
  }>;
}

export interface TeamInviteRequest {
  user_id: string;
  role: TeamRole;
}
