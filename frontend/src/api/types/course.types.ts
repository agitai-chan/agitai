import type { Pagination, CourseRole } from './common.types';

// ==========================================
// Course Types
// ==========================================

export interface Course {
  course_id: string;
  workspace_id: string;
  course_name: string;
  description?: string;
  thumbnail_image?: string;
  manager?: {
    user_id: string;
    nick_name: string;
  };
  module_count: number;
  team_count: number;
  participant_count: number;
  user_role: CourseRole;
  status: 'draft' | 'active' | 'completed';
  is_starred?: boolean;
  start_date?: string;
  end_date?: string;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseListResponse {
  courses: Course[];
  pagination?: Pagination;
}

export interface CourseDetail extends Course {
  experts?: CourseMember[];
  participants?: CourseMember[];
  progress?: {
    total_tasks: number;
    completed_tasks: number;
    percentage: number;
  };
}

export interface CourseMember {
  user_id: string;
  nick_name: string;
  email: string;
  profile_image?: string;
  role: CourseRole;
  team_id?: string;
  team_name?: string;
  joined_at?: string;
}

export interface CourseParticipant {
  user_id: string;
  nick_name: string;
  email: string;
  profile_image?: string;
  role: 'manager' | 'expert' | 'participant';
  team_id?: string;
  team_name?: string;
  joined_at?: string;
}

export interface CreateCourseRequest {
  course_name: string;
  description?: string;
  thumbnail_image?: File;
  start_date?: string;
  end_date?: string;
}

export interface UpdateCourseRequest {
  course_name?: string;
  description?: string;
  thumbnail_image?: File;
  start_date?: string;
  end_date?: string;
  status?: 'draft' | 'active' | 'completed';
}

export interface CourseSettings {
  course_id: string;
  course_name: string;
  description?: string;
  thumbnail_image?: string;
  manager: CourseMember;
  experts: CourseMember[];
  start_date?: string;
  end_date?: string;
  settings: {
    allow_participant_invite: boolean;
    require_review_approval: boolean;
  };
}

export interface UpdateCourseSettingsRequest {
  course_name?: string;
  description?: string;
  thumbnail_image?: File;
  new_manager_id?: string;
  settings?: {
    allow_participant_invite?: boolean;
    require_review_approval?: boolean;
  };
}

export interface CourseInviteRequest {
  invite_role: 'Expert' | 'Participant';
  max_uses?: number;
  expires_hours?: number;
}
