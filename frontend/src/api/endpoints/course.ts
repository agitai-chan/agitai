import { api } from '../axios';
import type { Course, CourseParticipant } from '../types';

// ==========================================
// Course API Endpoints
// ==========================================

export interface ListCoursesResponse {
  courses: Course[];
}

export async function listCourses(
  workspaceId: string,
  params?: {
    sort_by?: 'starred' | 'last_accessed' | 'name' | 'start_date';
    page?: number;
    limit?: number;
  }
): Promise<ListCoursesResponse> {
  const { data } = await api.get(`/workspaces/${workspaceId}/courses`, { params });
  return data;
}

export async function getCourse(
  workspaceId: string,
  courseId: string
): Promise<Course> {
  const { data } = await api.get(`/workspaces/${workspaceId}/courses/${courseId}`);
  return data;
}

export interface CreateCourseRequest {
  course_name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export async function createCourse(
  workspaceId: string,
  payload: CreateCourseRequest
): Promise<Course> {
  const { data } = await api.post(`/workspaces/${workspaceId}/courses`, payload);
  return data;
}

export interface UpdateCourseRequest {
  course_name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'draft' | 'active' | 'completed';
}

export async function updateCourse(
  workspaceId: string,
  courseId: string,
  payload: UpdateCourseRequest
): Promise<Course> {
  const { data } = await api.patch(
    `/workspaces/${workspaceId}/courses/${courseId}`,
    payload
  );
  return data;
}

export async function deleteCourse(
  workspaceId: string,
  courseId: string
): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/courses/${courseId}`);
}

export async function toggleCourseStar(
  workspaceId: string,
  courseId: string
): Promise<{ is_starred: boolean }> {
  const { data } = await api.post(
    `/workspaces/${workspaceId}/courses/${courseId}/star`
  );
  return data;
}

// ==========================================
// Course Participants
// ==========================================

export interface ListCourseParticipantsResponse {
  participants: CourseParticipant[];
}

export async function listCourseParticipants(
  workspaceId: string,
  courseId: string
): Promise<ListCourseParticipantsResponse> {
  const { data } = await api.get(
    `/workspaces/${workspaceId}/courses/${courseId}/participants`
  );
  return data;
}

export interface UpdateParticipantRoleRequest {
  role: 'manager' | 'expert' | 'participant';
}

export async function updateParticipantRole(
  workspaceId: string,
  courseId: string,
  userId: string,
  payload: UpdateParticipantRoleRequest
): Promise<CourseParticipant> {
  const { data } = await api.patch(
    `/workspaces/${workspaceId}/courses/${courseId}/participants/${userId}`,
    payload
  );
  return data;
}

export async function removeParticipant(
  workspaceId: string,
  courseId: string,
  userId: string
): Promise<void> {
  await api.delete(
    `/workspaces/${workspaceId}/courses/${courseId}/participants/${userId}`
  );
}

// ==========================================
// Course Invite
// ==========================================

export interface InviteLinkResponse {
  invite_link: string;
  expires_at?: string;
}

export async function getCourseInviteLink(
  workspaceId: string,
  courseId: string
): Promise<InviteLinkResponse> {
  const { data } = await api.get(
    `/workspaces/${workspaceId}/courses/${courseId}/invite`
  );
  return data;
}

export async function regenerateCourseInviteLink(
  workspaceId: string,
  courseId: string
): Promise<InviteLinkResponse> {
  const { data } = await api.post(
    `/workspaces/${workspaceId}/courses/${courseId}/invite/regenerate`
  );
  return data;
}
