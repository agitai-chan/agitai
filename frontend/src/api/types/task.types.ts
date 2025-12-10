import type { Pagination, TaskStatus, TabType, ReviewAction, AIModel } from './common.types';

// ==========================================
// Task Types
// ==========================================

export interface Task {
  task_id: string;
  module_id: string;
  course_id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  order_index: number;
  assignee_role?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  tasks: Task[];
  pagination: Pagination;
}

export interface TaskDetail extends Task {
  guide: Guide | null;
  product: Product | null;
  comment_count: number;
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  assignee_role?: string;
  order_index?: number;
  due_date?: string;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  status?: TaskStatus;
  assignee_role?: string;
  due_date?: string;
}

// ==========================================
// Team Task Types
// ==========================================

export interface TeamTask {
  team_task_id: string;
  team_id: string;
  task_id: string;
  task_name: string;
  module_name: string;
  status: TaskStatus;
  members: TeamTaskMember[];
  created_at: string;
  updated_at: string;
}

export interface TeamTaskDetail extends TeamTask {
  guide: Guide | null;
  prompt_tabs: PromptTab[];
  product: Product | null;
  comment_count: number;
}

export interface TeamTaskMember {
  user_id: string;
  nick_name: string;
  profile_image?: string;
  role: string;
}

export interface AssignTeamTaskRequest {
  task_id: string;
}

// ==========================================
// Guide Types
// ==========================================

export interface Guide {
  guide_id: string;
  task_id: string;
  guide_content: string;
  attachments: Attachment[];
  last_editor: {
    user_id: string;
    nick_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  attachment_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
}

export interface UpdateGuideRequest {
  guide_content: string;
  attachments?: File[];
  remove_attachment_ids?: string[];
}

// ==========================================
// Prompt Types
// ==========================================

export interface PromptTab {
  user_id: string;
  nick_name: string;
  profile_image?: string;
  conversation_count: number;
}

export interface PromptHistory {
  task_id: string;
  user_id: string;
  nick_name: string;
  conversations: PromptConversation[];
}

export interface PromptConversation {
  prompt_id: string;
  prompt_text: string;
  ai_response: string;
  ai_model: AIModel;
  tokens_used: number;
  created_at: string;
}

export interface PromptHistoryListResponse {
  history: PromptConversation[];
  pagination: Pagination;
}

export interface SubmitPromptRequest {
  prompt_text: string;
  ai_model?: AIModel;
  temperature?: number;
  max_tokens?: number;
}

export interface PromptResponse {
  prompt_id: string;
  prompt_text: string;
  ai_response: string;
  ai_model: string;
  tokens_used: number;
  created_at: string;
}

// ==========================================
// Product Types
// ==========================================

export interface Product {
  product_id: string;
  task_id: string;
  team_task_id?: string;
  product_content: string;
  status: TaskStatus;
  current_version: number;
  last_editor: {
    user_id: string;
    nick_name: string;
  };
  submitted_at?: string;
  reviewed_at?: string;
  review_result?: ReviewResult;
  created_at: string;
  updated_at: string;
}

export interface ReviewResult {
  action: ReviewAction;
  score?: number;
  rank?: number;
  feedback?: string;
}

export interface UpdateProductRequest {
  product_content: string;
  version_memo?: string;
}

export interface ReviewProductRequest {
  review_action: ReviewAction;
  score?: number;
  rank?: number;
  feedback_comment?: string;
}

export interface ProductVersion {
  version_id: string;
  version_number: number;
  product_content: string;
  version_memo?: string;
  editor: {
    user_id: string;
    nick_name: string;
  };
  created_at: string;
}

export interface ProductVersionListResponse {
  versions: ProductVersion[];
  pagination: Pagination;
}

// ==========================================
// Comment Types
// ==========================================

export interface Comment {
  comment_id: string;
  task_id: string;
  tab_type: TabType;
  prompt_user_id?: string;
  author: {
    user_id: string;
    nick_name: string;
    profile_image?: string;
  };
  comment_text: string;
  parent_comment_id?: string;
  mentioned_users: Array<{
    user_id: string;
    nick_name: string;
  }>;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentListResponse {
  comments: Comment[];
  pagination: Pagination;
}

export interface CreateCommentRequest {
  tab_type: TabType;
  prompt_user_id?: string;
  comment_text: string;
  parent_comment_id?: string;
  mention_user_ids?: string[];
}

// ==========================================
// AI Feedback Types
// ==========================================

export interface AIFeedbackRequest {
  prompt_id: string;
  evaluation_criteria?: Array<
    'clarity' | 'specificity' | 'context_provision' | 'output_format_specification'
  >;
}

export interface AIFeedbackResponse {
  feedback_id: string;
  prompt_id: string;
  scores: {
    clarity: number;
    specificity: number;
    context_provision: number;
    output_format_specification: number;
  };
  piq_score: number;
  strengths: string[];
  improvement_suggestions: string[];
  ai_comment: string;
  created_at: string;
}
