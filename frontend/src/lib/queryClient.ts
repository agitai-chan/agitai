import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 stale time: 1분
      staleTime: 1000 * 60,
      // 기본 캐시 time: 5분
      gcTime: 1000 * 60 * 5,
      // 재시도 1회
      retry: 1,
      // 윈도우 포커스 시 자동 리페치 비활성화
      refetchOnWindowFocus: false,
    },
    mutations: {
      // 뮤테이션 에러 시 재시도 안함
      retry: false,
    },
  },
});

// ==========================================
// Query Keys
// ==========================================

export const queryKeys = {
  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
  },
  
  // Workspace
  workspace: {
    all: ['workspace'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.workspace.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.workspace.all, 'detail', id] as const,
    settings: (id: string) => [...queryKeys.workspace.all, 'settings', id] as const,
    members: (id: string) => [...queryKeys.workspace.all, 'members', id] as const,
    invite: (id: string) => [...queryKeys.workspace.all, 'invite', id] as const,
  },
  
  // Course
  course: {
    all: ['course'] as const,
    list: (workspaceId: string, params?: Record<string, unknown>) =>
      [...queryKeys.course.all, 'list', workspaceId, params] as const,
    detail: (workspaceId: string, courseId: string) =>
      [...queryKeys.course.all, 'detail', workspaceId, courseId] as const,
    settings: (workspaceId: string, courseId: string) =>
      [...queryKeys.course.all, 'settings', workspaceId, courseId] as const,
    participants: (courseId: string) =>
      [...queryKeys.course.all, 'participants', courseId] as const,
    invite: (courseId: string) =>
      [...queryKeys.course.all, 'invite', courseId] as const,
  },
  
  // Module
  module: {
    all: ['module'] as const,
    list: (courseId: string) => [...queryKeys.module.all, 'list', courseId] as const,
    detail: (courseId: string, moduleId: string) =>
      [...queryKeys.module.all, 'detail', courseId, moduleId] as const,
  },
  
  // Team
  team: {
    all: ['team'] as const,
    list: (courseId: string, params?: Record<string, unknown>) =>
      [...queryKeys.team.all, 'list', courseId, params] as const,
    detail: (teamId: string) =>
      [...queryKeys.team.all, 'detail', teamId] as const,
    members: (teamId: string) =>
      [...queryKeys.team.all, 'members', teamId] as const,
    tasks: (teamId: string) =>
      [...queryKeys.team.all, 'tasks', teamId] as const,
    task: (teamTaskId: string) =>
      [...queryKeys.team.all, 'task', teamTaskId] as const,
  },
  
  // Task
  task: {
    all: ['task'] as const,
    list: (courseId: string, moduleId: string, params?: Record<string, unknown>) =>
      [...queryKeys.task.all, 'list', courseId, moduleId, params] as const,
    detail: (taskId: string) =>
      [...queryKeys.task.all, 'detail', taskId] as const,
  },
  
  // Team Task
  teamTask: {
    all: ['teamTask'] as const,
    detail: (courseId: string, teamId: string, teamTaskId: string) =>
      [...queryKeys.teamTask.all, 'detail', courseId, teamId, teamTaskId] as const,
  },
  
  // Guide
  guide: {
    all: ['guide'] as const,
    detail: (taskId: string) => [...queryKeys.guide.all, 'detail', taskId] as const,
  },
  
  // Prompt
  prompt: {
    all: ['prompt'] as const,
    history: (taskId: string, userId: string, params?: Record<string, unknown>) =>
      [...queryKeys.prompt.all, 'history', taskId, userId, params] as const,
  },
  
  // Product
  product: {
    all: ['product'] as const,
    detail: (taskId: string, teamTaskId?: string) =>
      [...queryKeys.product.all, 'detail', taskId, teamTaskId] as const,
    versions: (taskId: string, params?: Record<string, unknown>) =>
      [...queryKeys.product.all, 'versions', taskId, params] as const,
  },
  
  // Comment
  comment: {
    all: ['comment'] as const,
    list: (taskId: string, params?: Record<string, unknown>) =>
      [...queryKeys.comment.all, 'list', taskId, params] as const,
  },
};
