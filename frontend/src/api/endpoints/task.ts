import { apiClient, apiClientMultipart } from '../axios';
import { createFormData } from '@/utils/fileUpload';
import type {
  Task,
  TaskListResponse,
  TaskDetail,
  CreateTaskRequest,
  UpdateTaskRequest,
  TeamTask,
  TeamTaskDetail,
  AssignTeamTaskRequest,
  Guide,
  UpdateGuideRequest,
  PromptHistory,
  PromptHistoryListResponse,
  SubmitPromptRequest,
  PromptResponse,
  Product,
  UpdateProductRequest,
  ReviewProductRequest,
  ProductVersionListResponse,
  Comment,
  CommentListResponse,
  CreateCommentRequest,
  AIFeedbackRequest,
  AIFeedbackResponse,
  MessageResponse,
  TaskStatus,
  TabType,
} from '../types';

// ==========================================
// Task API Endpoints
// ==========================================

/**
 * 태스크 목록 조회
 * GET /course/{courseId}/module/{moduleId}/tasks
 */
export const listTasks = async (
  courseId: string,
  moduleId: string,
  params?: {
    filter?: 'all' | TaskStatus;
    page?: number;
    limit?: number;
  }
): Promise<TaskListResponse> => {
  const response = await apiClient.get<TaskListResponse>(
    `/course/${courseId}/module/${moduleId}/tasks`,
    { params }
  );
  return response.data;
};

/**
 * 태스크 생성
 * POST /course/{courseId}/module/{moduleId}/task/create
 */
export const createTask = async (
  courseId: string,
  moduleId: string,
  data: CreateTaskRequest
): Promise<Task> => {
  const response = await apiClient.post<Task>(
    `/course/${courseId}/module/${moduleId}/task/create`,
    data
  );
  return response.data;
};

/**
 * 태스크 상세 조회
 * GET /course/{courseId}/module/{moduleId}/task/{taskId}
 */
export const getTaskDetail = async (
  courseId: string,
  moduleId: string,
  taskId: string
): Promise<TaskDetail> => {
  const response = await apiClient.get<TaskDetail>(
    `/course/${courseId}/module/${moduleId}/task/${taskId}`
  );
  return response.data;
};

/**
 * 태스크 수정
 * PUT /course/{courseId}/module/{moduleId}/task/{taskId}
 */
export const updateTask = async (
  courseId: string,
  moduleId: string,
  taskId: string,
  data: UpdateTaskRequest
): Promise<TaskDetail> => {
  const response = await apiClient.put<TaskDetail>(
    `/course/${courseId}/module/${moduleId}/task/${taskId}`,
    data
  );
  return response.data;
};

/**
 * 태스크 삭제
 * DELETE /course/{courseId}/module/{moduleId}/task/{taskId}
 */
export const deleteTask = async (
  courseId: string,
  moduleId: string,
  taskId: string
): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(
    `/course/${courseId}/module/${moduleId}/task/${taskId}`
  );
  return response.data;
};

/**
 * 태스크 모듈 이동
 * POST /course/{courseId}/module/{moduleId}/task/{taskId}/move
 */
export const moveTask = async (
  courseId: string,
  moduleId: string,
  taskId: string,
  targetModuleId: string
): Promise<Task> => {
  const response = await apiClient.post<Task>(
    `/course/${courseId}/module/${moduleId}/task/${taskId}/move`,
    { target_module_id: targetModuleId }
  );
  return response.data;
};

// ==========================================
// Team Task API Endpoints
// ==========================================

/**
 * 팀 태스크 생성 (내보내기)
 * POST /course/{courseId}/team/{teamId}/task/assign
 */
export const assignTeamTask = async (
  courseId: string,
  teamId: string,
  data: AssignTeamTaskRequest
): Promise<TeamTask> => {
  const response = await apiClient.post<TeamTask>(
    `/course/${courseId}/team/${teamId}/task/assign`,
    data
  );
  return response.data;
};

/**
 * 팀 태스크 상세 조회
 * GET /course/{courseId}/team/{teamId}/task/{teamTaskId}
 */
export const getTeamTaskDetail = async (
  courseId: string,
  teamId: string,
  teamTaskId: string
): Promise<TeamTaskDetail> => {
  const response = await apiClient.get<TeamTaskDetail>(
    `/course/${courseId}/team/${teamId}/task/${teamTaskId}`
  );
  return response.data;
};

// ==========================================
// Guide API Endpoints
// ==========================================

/**
 * 가이드 조회
 * GET /task/{taskId}/guide
 */
export const getGuide = async (taskId: string): Promise<Guide> => {
  const response = await apiClient.get<Guide>(`/task/${taskId}/guide`);
  return response.data;
};

/**
 * 가이드 수정
 * PUT /task/{taskId}/guide/edit
 */
export const updateGuide = async (
  taskId: string,
  data: UpdateGuideRequest
): Promise<Guide> => {
  const formData = createFormData({
    guide_content: data.guide_content,
    attachments: data.attachments,
    remove_attachment_ids: data.remove_attachment_ids,
  });

  const response = await apiClientMultipart.put<Guide>(
    `/task/${taskId}/guide/edit`,
    formData
  );
  return response.data;
};

// ==========================================
// Prompt API Endpoints
// ==========================================

/**
 * 프롬프트 조회
 * GET /task/{taskId}/prompt/{userId}
 */
export const getPrompt = async (taskId: string, userId: string): Promise<PromptHistory> => {
  const response = await apiClient.get<PromptHistory>(`/task/${taskId}/prompt/${userId}`);
  return response.data;
};

/**
 * 프롬프트 입력 (AI 실행)
 * POST /task/{taskId}/prompt/{userId}
 */
export const submitPrompt = async (
  taskId: string,
  userId: string,
  data: SubmitPromptRequest
): Promise<PromptResponse> => {
  const response = await apiClient.post<PromptResponse>(
    `/task/${taskId}/prompt/${userId}`,
    data
  );
  return response.data;
};

/**
 * 프롬프트 히스토리 조회
 * GET /task/{taskId}/prompt/{userId}/history
 */
export const getPromptHistory = async (
  taskId: string,
  userId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<PromptHistoryListResponse> => {
  const response = await apiClient.get<PromptHistoryListResponse>(
    `/task/${taskId}/prompt/${userId}/history`,
    { params }
  );
  return response.data;
};

/**
 * AI 피드백 요청
 * POST /task/{taskId}/prompt/{userId}/feedback
 */
export const requestAIFeedback = async (
  taskId: string,
  userId: string,
  data: AIFeedbackRequest
): Promise<AIFeedbackResponse> => {
  const response = await apiClient.post<AIFeedbackResponse>(
    `/task/${taskId}/prompt/${userId}/feedback`,
    data
  );
  return response.data;
};

// ==========================================
// Product API Endpoints
// ==========================================

/**
 * 프로덕트 조회
 * GET /task/{taskId}/product
 */
export const getProduct = async (
  taskId: string,
  teamTaskId?: string
): Promise<Product> => {
  const response = await apiClient.get<Product>(`/task/${taskId}/product`, {
    params: teamTaskId ? { team_task_id: teamTaskId } : undefined,
  });
  return response.data;
};

/**
 * 프로덕트 수정
 * PUT /task/{taskId}/product/edit
 */
export const updateProduct = async (
  taskId: string,
  data: UpdateProductRequest
): Promise<Product> => {
  const response = await apiClient.put<Product>(`/task/${taskId}/product/edit`, data);
  return response.data;
};

/**
 * 프로덕트 리뷰 제출
 * POST /task/{taskId}/product/submit
 */
export const submitProduct = async (
  taskId: string,
  submitMemo?: string
): Promise<Product> => {
  const response = await apiClient.post<Product>(`/task/${taskId}/product/submit`, {
    submit_memo: submitMemo,
  });
  return response.data;
};

/**
 * 프로덕트 리뷰
 * POST /task/{taskId}/product/review
 */
export const reviewProduct = async (
  taskId: string,
  data: ReviewProductRequest
): Promise<Product> => {
  const response = await apiClient.post<Product>(`/task/${taskId}/product/review`, data);
  return response.data;
};

/**
 * 프로덕트 버전 목록 조회
 * GET /task/{taskId}/product/versions
 */
export const getProductVersions = async (
  taskId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<ProductVersionListResponse> => {
  const response = await apiClient.get<ProductVersionListResponse>(
    `/task/${taskId}/product/versions`,
    { params }
  );
  return response.data;
};

// ==========================================
// Comment API Endpoints
// ==========================================

/**
 * 코멘트 목록 조회
 * GET /task/{taskId}/comments
 */
export const listComments = async (
  taskId: string,
  params?: {
    tab_type?: TabType;
    prompt_user_id?: string;
    page?: number;
    limit?: number;
  }
): Promise<CommentListResponse> => {
  const response = await apiClient.get<CommentListResponse>(
    `/task/${taskId}/comments`,
    { params }
  );
  return response.data;
};

/**
 * 코멘트 작성
 * POST /task/{taskId}/comments
 */
export const createComment = async (
  taskId: string,
  data: CreateCommentRequest
): Promise<Comment> => {
  const response = await apiClient.post<Comment>(`/task/${taskId}/comments`, data);
  return response.data;
};

/**
 * 코멘트 수정
 * PUT /task/{taskId}/comments/{commentId}
 */
export const updateComment = async (
  taskId: string,
  commentId: string,
  commentText: string
): Promise<Comment> => {
  const response = await apiClient.put<Comment>(
    `/task/${taskId}/comments/${commentId}`,
    { comment_text: commentText }
  );
  return response.data;
};

/**
 * 코멘트 삭제
 * DELETE /task/{taskId}/comments/{commentId}
 */
export const deleteComment = async (
  taskId: string,
  commentId: string
): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(
    `/task/${taskId}/comments/${commentId}`
  );
  return response.data;
};
