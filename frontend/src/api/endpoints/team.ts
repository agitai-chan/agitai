import { api } from '../axios';
import type { Team, TeamMember, TeamTask } from '../types';

// ==========================================
// Team Endpoints
// ==========================================

export interface ListTeamsResponse {
  teams: Team[];
}

export async function listTeams(
  workspaceId: string,
  courseId: string
): Promise<ListTeamsResponse> {
  const { data } = await api.get(
    `/workspaces/${workspaceId}/courses/${courseId}/teams`
  );
  return data;
}

export async function getTeam(
  workspaceId: string,
  courseId: string,
  teamId: string
): Promise<Team> {
  const { data } = await api.get(
    `/workspaces/${workspaceId}/courses/${courseId}/teams/${teamId}`
  );
  return data;
}

export interface CreateTeamRequest {
  team_name: string;
  description?: string;
}

export async function createTeam(
  workspaceId: string,
  courseId: string,
  payload: CreateTeamRequest
): Promise<Team> {
  const { data } = await api.post(
    `/workspaces/${workspaceId}/courses/${courseId}/teams`,
    payload
  );
  return data;
}

export interface UpdateTeamRequest {
  team_name?: string;
  description?: string;
}

export async function updateTeam(
  workspaceId: string,
  courseId: string,
  teamId: string,
  payload: UpdateTeamRequest
): Promise<Team> {
  const { data } = await api.patch(
    `/workspaces/${workspaceId}/courses/${courseId}/teams/${teamId}`,
    payload
  );
  return data;
}

export async function deleteTeam(
  workspaceId: string,
  courseId: string,
  teamId: string
): Promise<void> {
  await api.delete(
    `/workspaces/${workspaceId}/courses/${courseId}/teams/${teamId}`
  );
}

// ==========================================
// Team Members
// ==========================================

export interface ListTeamMembersResponse {
  members: TeamMember[];
}

export async function listTeamMembers(
  workspaceId: string,
  courseId: string,
  teamId: string
): Promise<ListTeamMembersResponse> {
  const { data } = await api.get(
    `/workspaces/${workspaceId}/courses/${courseId}/teams/${teamId}/members`
  );
  return data;
}

export interface AssignTeamMemberRequest {
  user_id: string;
  team_role?: string;
}

export async function assignTeamMember(
  workspaceId: string,
  courseId: string,
  teamId: string,
  payload: AssignTeamMemberRequest
): Promise<TeamMember> {
  const { data } = await api.post(
    `/workspaces/${workspaceId}/courses/${courseId}/teams/${teamId}/members`,
    payload
  );
  return data;
}

export async function removeTeamMember(
  workspaceId: string,
  courseId: string,
  teamId: string,
  userId: string
): Promise<void> {
  await api.delete(
    `/workspaces/${workspaceId}/courses/${courseId}/teams/${teamId}/members/${userId}`
  );
}

export interface UpdateTeamMemberRoleRequest {
  team_role: string;
}

export async function updateTeamMemberRole(
  workspaceId: string,
  courseId: string,
  teamId: string,
  userId: string,
  payload: UpdateTeamMemberRoleRequest
): Promise<TeamMember> {
  const { data } = await api.patch(
    `/workspaces/${workspaceId}/courses/${courseId}/teams/${teamId}/members/${userId}`,
    payload
  );
  return data;
}

// ==========================================
// Team Tasks
// ==========================================

export interface ListTeamTasksResponse {
  tasks: TeamTask[];
}

export async function listTeamTasks(
  workspaceId: string,
  courseId: string,
  teamId: string
): Promise<ListTeamTasksResponse> {
  const { data } = await api.get(
    `/workspaces/${workspaceId}/courses/${courseId}/teams/${teamId}/tasks`
  );
  return data;
}

export async function getTeamTask(
  workspaceId: string,
  courseId: string,
  teamId: string,
  teamTaskId: string
): Promise<TeamTask> {
  const { data } = await api.get(
    `/workspaces/${workspaceId}/courses/${courseId}/teams/${teamId}/tasks/${teamTaskId}`
  );
  return data;
}
