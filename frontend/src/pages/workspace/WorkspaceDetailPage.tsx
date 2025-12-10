import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Settings,
  Users,
  BookOpen,
  Star,
  MoreHorizontal,
  Trash2,
  UserPlus,
  Copy,
  Check,
} from 'lucide-react';
import { Button, Badge, Card, Tabs } from '@/components/ui';
import { CreateCourseModal } from '@/components/course/CreateCourseModal';
import { InviteMemberModal } from '@/components/workspace/InviteMemberModal';
import { getWorkspace, listWorkspaceMembers, toggleWorkspaceStar } from '@/api/endpoints/workspace';
import { listCourses, deleteCourse } from '@/api/endpoints/course';
import { queryKeys } from '@/lib/queryClient';
import type { Course, WorkspaceMember } from '@/api/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';

export function WorkspaceDetailPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [activeTab, setActiveTab] = useState('courses');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const queryClient = useQueryClient();

  // 워크스페이스 상세 조회
  const { data: workspace, isLoading: workspaceLoading } = useQuery({
    queryKey: queryKeys.workspace.detail(workspaceId!),
    queryFn: () => getWorkspace(workspaceId!),
    enabled: !!workspaceId,
  });

  // 코스 목록 조회
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: queryKeys.course.list(workspaceId!),
    queryFn: () => listCourses(workspaceId!),
    enabled: !!workspaceId && activeTab === 'courses',
  });

  // 멤버 목록 조회
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: queryKeys.workspace.members(workspaceId!),
    queryFn: () => listWorkspaceMembers(workspaceId!),
    enabled: !!workspaceId && activeTab === 'members',
  });

  // 즐겨찾기 토글
  const starMutation = useMutation({
    mutationFn: () => toggleWorkspaceStar(workspaceId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.detail(workspaceId!) });
    },
  });

  if (workspaceLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg font-medium text-slate-900">워크스페이스를 찾을 수 없습니다</p>
        <Link to="/workspaces" className="mt-2 text-primary-600 hover:underline">
          워크스페이스 목록으로
        </Link>
      </div>
    );
  }

  const courses = coursesData?.courses || [];
  const members = membersData?.members || [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white"
              style={{ backgroundColor: workspace.workspace_color || '#6366f1' }}
            >
              {workspace.workspace_name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{workspace.workspace_name}</h1>
                <button onClick={() => starMutation.mutate()}>
                  <Star
                    className={`h-5 w-5 ${
                      workspace.is_starred ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              </div>
              <p className="mt-1 text-slate-500">{workspace.description || '설명이 없습니다'}</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  멤버 {workspace.member_count}명
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  코스 {workspace.course_count}개
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowInvite(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              초대
            </Button>
            <Link to={`/workspace/${workspaceId}/settings`}>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white px-6">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="courses">
              <BookOpen className="mr-2 h-4 w-4" />
              코스
            </Tabs.Tab>
            <Tabs.Tab value="members">
              <Users className="mr-2 h-4 w-4" />
              멤버
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'courses' && (
          <CoursesTab
            workspaceId={workspaceId!}
            courses={courses}
            isLoading={coursesLoading}
            onCreateClick={() => setShowCreateCourse(true)}
          />
        )}
        {activeTab === 'members' && (
          <MembersTab
            workspaceId={workspaceId!}
            members={members}
            isLoading={membersLoading}
            onInviteClick={() => setShowInvite(true)}
          />
        )}
      </div>

      {/* Modals */}
      <CreateCourseModal
        workspaceId={workspaceId!}
        isOpen={showCreateCourse}
        onClose={() => setShowCreateCourse(false)}
      />
      <InviteMemberModal
        workspaceId={workspaceId!}
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
      />
    </div>
  );
}

// ==========================================
// Courses Tab
// ==========================================

interface CoursesTabProps {
  workspaceId: string;
  courses: Course[];
  isLoading: boolean;
  onCreateClick: () => void;
}

function CoursesTab({ workspaceId, courses, isLoading, onCreateClick }: CoursesTabProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (courseId: string) => deleteCourse(workspaceId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course.list(workspaceId) });
      toast.success('코스가 삭제되었습니다.');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <BookOpen className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-lg font-medium text-slate-900">아직 코스가 없습니다</p>
        <p className="mt-1 text-slate-500">첫 번째 코스를 만들어보세요</p>
        <Button className="mt-4" onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          코스 만들기
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          새 코스
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard
            key={course.course_id}
            course={course}
            workspaceId={workspaceId}
            onDelete={() => {
              if (confirm('정말 이 코스를 삭제하시겠습니까?')) {
                deleteMutation.mutate(course.course_id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// Course Card
// ==========================================

interface CourseCardProps {
  course: Course;
  workspaceId: string;
  onDelete: () => void;
}

function CourseCard({ course, workspaceId, onDelete }: CourseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <Link to={`/workspace/${workspaceId}/course/${course.course_id}`}>
        <Card.Content className="p-4">
          <div className="mb-3 flex items-start justify-between">
            <Badge
              variant={course.status === 'active' ? 'success' : 'default'}
              size="sm"
            >
              {course.status === 'active' ? '진행 중' : '대기'}
            </Badge>
            <Badge variant="outline" size="sm">
              {course.user_role}
            </Badge>
          </div>
          <h3 className="mb-1 font-semibold text-slate-900">{course.course_name}</h3>
          <p className="mb-3 line-clamp-2 text-sm text-slate-500">
            {course.description || '설명이 없습니다'}
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.participant_count}명
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {course.module_count}개 모듈
            </span>
          </div>
        </Card.Content>
      </Link>

      {/* Menu */}
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(!menuOpen);
            }}
            className="rounded p-1.5 hover:bg-slate-100"
          >
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border bg-white py-1 shadow-lg">
              <Link
                to={`/workspace/${workspaceId}/course/${course.course_id}/settings`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                설정
              </Link>
              {course.user_role === 'manager' && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ==========================================
// Members Tab
// ==========================================

interface MembersTabProps {
  workspaceId: string;
  members: WorkspaceMember[];
  isLoading: boolean;
  onInviteClick: () => void;
}

function MembersTab({ workspaceId, members, isLoading, onInviteClick }: MembersTabProps) {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={onInviteClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          멤버 초대
        </Button>
      </div>
      <Card>
        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <div key={member.user_id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-medium">
                  {member.profile_image ? (
                    <img
                      src={member.profile_image}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    member.nick_name[0].toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{member.nick_name}</p>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
              </div>
              <Badge variant={member.role === 'owner' ? 'primary' : 'default'}>
                {member.role === 'owner' ? '소유자' : '멤버'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
