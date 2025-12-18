import { api } from '../axios';
import type {
  Workspace,
  WorkspaceMember,
} from '../types';

// ==========================================
// Workspace API Endpoints
// ==========================================

export interface ListWorkspacesResponse {
  workspaces: Workspace[];
}

export async function listWorkspaces(params?: {
  sort_by?: 'starred' | 'last_accessed' | 'created_at' | 'name';
  filter?: 'all' | 'owned' | 'joined';
  page?: number;
  limit?: number;
}): Promise<ListWorkspacesResponse> {
  const { data } = await api.get('/workspaces', { params });
  return data;
}

export async function getWorkspace(workspaceId: string): Promise<Workspace> {
  const { data } = await api.get(`/workspaces/${workspaceId}`);
  return data;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export async function createWorkspace(payload: CreateWorkspaceRequest): Promise<Workspace> {
  const { data } = await api.post('/workspaces', payload);
  return data;
}

export interface UpdateWorkspaceRequest {
  workspace_name?: string;
  description?: string;
  workspace_color?: string;
}

export async function updateWorkspace(
  workspaceId: string,
  payload: UpdateWorkspaceRequest
): Promise<Workspace> {
  const { data } = await api.patch(`/workspaces/${workspaceId}`, payload);
  return data;
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}`);
}

export async function toggleWorkspaceStar(
  workspaceId: string
): Promise<{ is_starred: boolean }> {
  const { data } = await api.post(`/workspaces/${workspaceId}/star`);
  return data;
}

// ==========================================
// Workspace Members
// ==========================================

export interface ListWorkspaceMembersResponse {
  members: WorkspaceMember[];
}

export async function listWorkspaceMembers(
  workspaceId: string
): Promise<ListWorkspaceMembersResponse> {
  const { data } = await api.get(`/workspaces/${workspaceId}/members`);
  return data;
}

export async function removeMember(
  workspaceId: string,
  userId: string
): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
}

// ==========================================
// Workspace Invite
// ==========================================

export interface InviteLinkResponse {
  invite_link: string;
  expires_at?: string;
}

export async function getWorkspaceInviteLink(
  workspaceId: string
): Promise<InviteLinkResponse> {
  const { data } = await api.get(`/workspaces/${workspaceId}/invite`);
  return data;
}

export async function regenerateInviteLink(
  workspaceId: string
): Promise<InviteLinkResponse> {
  const { data } = await api.post(`/workspaces/${workspaceId}/invite/regenerate`);
  return data;
}
