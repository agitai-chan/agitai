import type { Pagination } from './common.types';

// ==========================================
// Module Types
// ==========================================

export interface Module {
  module_id: string;
  course_id: string;
  name: string;
  description?: string;
  order_index: number;
  task_count: number;
  completed_task_count: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleListResponse {
  modules: Module[];
  pagination: Pagination;
}

export interface ModuleDetail extends Module {
  tasks: ModuleTask[];
}

export interface ModuleTask {
  task_id: string;
  name: string;
  status: string;
  order_index: number;
  assignee_role?: string;
}

export interface CreateModuleRequest {
  name: string;
  description?: string;
  order_index?: number;
}

export interface UpdateModuleRequest {
  name?: string;
  description?: string;
}

export interface ReorderModulesRequest {
  module_orders: Array<{
    module_id: string;
    order_index: number;
  }>;
}

export interface ExportToTeamRequest {
  team_ids: string[];
}

export interface ExportToTeamResponse {
  exported_count: number;
  team_tasks: Array<{
    team_id: string;
    team_name: string;
    team_task_id: string;
  }>;
}
