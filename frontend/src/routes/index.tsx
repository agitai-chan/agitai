import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { PasswordResetPage } from '@/pages/auth/PasswordResetPage';

// Main Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { WorkspaceListPage } from '@/pages/workspace/WorkspaceListPage';
import { WorkspaceDetailPage } from '@/pages/workspace/WorkspaceDetailPage';
import { WorkspaceSettingsPage } from '@/pages/workspace/WorkspaceSettingsPage';
import { CourseDetailPage } from '@/pages/course/CourseDetailPage';
import { CourseSettingsPage } from '@/pages/course/CourseSettingsPage';
import { TeamDetailPage } from '@/pages/team/TeamDetailPage';
import { TaskDetailPage } from '@/pages/task/TaskDetailPage';
import { TeamTaskDetailPage } from '@/pages/task/TeamTaskDetailPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';

// Error Pages
import { NotFoundPage } from '@/pages/error/NotFoundPage';
import { ErrorPage } from '@/pages/error/ErrorPage';

export const router = createBrowserRouter([
  // 인증 라우트
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup',
        element: <SignupPage />,
      },
      {
        path: '/password-reset',
        element: <PasswordResetPage />,
      },
    ],
  },
  
  // 메인 라우트 (인증 필요)
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      // 홈 -> 대시보드로 리다이렉트
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      
      // 대시보드
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      
      // 워크스페이스
      {
        path: '/workspaces',
        element: <WorkspaceListPage />,
      },
      {
        path: '/workspace/:workspaceId',
        element: <WorkspaceDetailPage />,
      },
      {
        path: '/workspace/:workspaceId/settings',
        element: <WorkspaceSettingsPage />,
      },
      
      // 코스
      {
        path: '/workspace/:workspaceId/course/:courseId',
        element: <CourseDetailPage />,
      },
      {
        path: '/workspace/:workspaceId/course/:courseId/settings',
        element: <CourseSettingsPage />,
      },
      
      // 팀
      {
        path: '/workspace/:workspaceId/course/:courseId/team/:teamId',
        element: <TeamDetailPage />,
      },
      
      // 태스크 (3탭 구조)
      {
        path: '/workspace/:workspaceId/course/:courseId/module/:moduleId/task/:taskId',
        element: <TaskDetailPage />,
      },
      
      // 팀 태스크
      {
        path: '/workspace/:workspaceId/course/:courseId/team/:teamId/task/:teamTaskId',
        element: <TeamTaskDetailPage />,
      },
      
      // 프로필
      {
        path: '/profile',
        element: <ProfilePage />,
      },
    ],
  },
  
  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
