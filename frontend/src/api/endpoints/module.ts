import { api } from '../axios';
import type { Module, Task } from '../types';

// ==========================================
// Module Endpoints
// ==========================================

export interface ListModulesResponse {
  modules: Module[];
}

export async function listModules(
  workspaceId: string,
  courseId: string
): Promise<ListModulesResponse> {
  const { data } = await api.get(
    `/workspaces/${workspaceId}/courses/${courseId}/modules`
  );
  return data;
}

export async function getModule(
  workspaceId: string,
  courseId: string,
  moduleId: string
): Promise<Module> {
  const { data } = await api.get(
    `/workspaces/${workspaceId}/courses/${courseId}/modules/${moduleId}`
  );
  return data;
}

export interface CreateModuleRequest {
  module_name: string;
  description?: string;
  order_index?: number;
}

export async function createModule(
  workspaceId: string,
  courseId: string,
  payload: CreateModuleRequest
): Promise<Module> {
  const { data } = await api.post(
    `/workspaces/${workspaceId}/courses/${courseId}/modules`,
    payload
  );
  return data;
}

export interface UpdateModuleRequest {
  module_name?: string;
  description?: string;
  order_index?: number;
}

export async function updateModule(
  workspaceId: string,
  courseId: string,
  moduleId: string,
  payload: UpdateModuleRequest
): Promise<Module> {
  const { data } = await api.patch(
    `/workspaces/${workspaceId}/courses/${courseId}/modules/${moduleId}`,
    payload
  );
  return data;
}

export async function deleteModule(
  workspaceId: string,
  courseId: string,
  moduleId: string
): Promise<void> {
  await api.delete(
    `/workspaces/${workspaceId}/courses/${courseId}/modules/${moduleId}`
  );
}

// ==========================================
// Module Tasks
// ==========================================

export interface ListModuleTasksResponse {
  tasks: Task[];
}

export async function listModuleTasks(
  workspaceId: string,
  courseId: string,
  moduleId: string
): Promise<ListModuleTasksResponse> {
  const { data } = await api.get(
    `/workspaces/${workspaceId}/courses/${courseId}/modules/${moduleId}/tasks`
  );
  return data;
}

export interface CreateTaskRequest {
  task_name: string;
  description?: string;
  order_index?: number;
}

export async function createTask(
  workspaceId: string,
  courseId: string,
  moduleId: string,
  payload: CreateTaskRequest
): Promise<Task> {
  const { data } = await api.post(
    `/workspaces/${workspaceId}/courses/${courseId}/modules/${moduleId}/tasks`,
    payload
  );
  return data;
}

export async function reorderModules(
  workspaceId: string,
  courseId: string,
  moduleIds: string[]
): Promise<void> {
  await api.post(
    `/workspaces/${workspaceId}/courses/${courseId}/modules/reorder`,
    { module_ids: moduleIds }
  );
}
