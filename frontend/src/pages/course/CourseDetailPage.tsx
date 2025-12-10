import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Settings,
  Users,
  BookOpen,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  UserPlus,
  CheckCircle,
  Clock,
  Play,
} from 'lucide-react';
import { Button, Badge, Card, Tabs } from '@/components/ui';
import { CreateModuleModal } from '@/components/course/CreateModuleModal';
import { CreateTeamModal } from '@/components/course/CreateTeamModal';
import { InviteParticipantModal } from '@/components/course/InviteParticipantModal';
import { getCourse, listCourseParticipants } from '@/api/endpoints/course';
import { listModules, deleteModule } from '@/api/endpoints/module';
import { listTeams, deleteTeam } from '@/api/endpoints/team';
import { queryKeys } from '@/lib/queryClient';
import type { Module, Team, CourseParticipant, Task } from '@/api/types';
import { TASK_STATUS } from '@/utils/constants';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';

export function CourseDetailPage() {
  const { workspaceId, courseId } = useParams<{ workspaceId: string; courseId: string }>();
  const [activeTab, setActiveTab] = useState('modules');
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // 코스 상세 조회
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: queryKeys.course.detail(workspaceId!, courseId!),
    queryFn: () => getCourse(workspaceId!, courseId!),
    enabled: !!workspaceId && !!courseId,
  });

  // 모듈 목록 조회
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: queryKeys.module.list(courseId!),
    queryFn: () => listModules(workspaceId!, courseId!),
    enabled: !!courseId && activeTab === 'modules',
  });

  // 팀 목록 조회
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: queryKeys.team.list(courseId!),
    queryFn: () => listTeams(workspaceId!, courseId!),
    enabled: !!courseId && activeTab === 'teams',
  });

  // 참가자 목록 조회
  const { data: participantsData, isLoading: participantsLoading } = useQuery({
    queryKey: queryKeys.course.participants(courseId!),
    queryFn: () => listCourseParticipants(workspaceId!, courseId!),
    enabled: !!courseId && activeTab === 'participants',
  });

  if (courseLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg font-medium text-slate-900">코스를 찾을 수 없습니다</p>
        <Link to={`/workspace/${workspaceId}`} className="mt-2 text-primary-600 hover:underline">
          워크스페이스로 돌아가기
        </Link>
      </div>
    );
  }

  const modules = modulesData?.modules || [];
  const teams = teamsData?.teams || [];
  const participants = participantsData?.participants || [];

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link to={`/workspace/${workspaceId}`} className="hover:text-slate-900">
            워크스페이스
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-slate-900">{course.course_name}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{course.course_name}</h1>
              <Badge variant={course.status === 'active' ? 'success' : 'default'}>
                {course.status === 'active' ? '진행 중' : '대기'}
              </Badge>
            </div>
            <p className="mt-1 text-slate-500">{course.description || '설명이 없습니다'}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                참가자 {course.participant_count}명
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                모듈 {course.module_count}개
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                팀 {course.team_count}개
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowInvite(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              참가자 초대
            </Button>
            <Link to={`/workspace/${workspaceId}/course/${courseId}/settings`}>
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
            <Tabs.Tab value="modules">
              <BookOpen className="mr-2 h-4 w-4" />
              모듈
            </Tabs.Tab>
            <Tabs.Tab value="teams">
              <Users className="mr-2 h-4 w-4" />
              팀
            </Tabs.Tab>
            <Tabs.Tab value="participants">
              <Users className="mr-2 h-4 w-4" />
              참가자
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'modules' && (
          <ModulesTab
            workspaceId={workspaceId!}
            courseId={courseId!}
            modules={modules}
            isLoading={modulesLoading}
            expandedModule={expandedModule}
            onToggleExpand={setExpandedModule}
            onCreateClick={() => setShowCreateModule(true)}
          />
        )}
        {activeTab === 'teams' && (
          <TeamsTab
            workspaceId={workspaceId!}
            courseId={courseId!}
            teams={teams}
            isLoading={teamsLoading}
            onCreateClick={() => setShowCreateTeam(true)}
          />
        )}
        {activeTab === 'participants' && (
          <ParticipantsTab
            participants={participants}
            isLoading={participantsLoading}
            onInviteClick={() => setShowInvite(true)}
          />
        )}
      </div>

      {/* Modals */}
      <CreateModuleModal
        workspaceId={workspaceId!}
        courseId={courseId!}
        isOpen={showCreateModule}
        onClose={() => setShowCreateModule(false)}
      />
      <CreateTeamModal
        workspaceId={workspaceId!}
        courseId={courseId!}
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
      />
      <InviteParticipantModal
        workspaceId={workspaceId!}
        courseId={courseId!}
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
      />
    </div>
  );
}

// ==========================================
// Modules Tab
// ==========================================

interface ModulesTabProps {
  workspaceId: string;
  courseId: string;
  modules: Module[];
  isLoading: boolean;
  expandedModule: string | null;
  onToggleExpand: (moduleId: string | null) => void;
  onCreateClick: () => void;
}

function ModulesTab({
  workspaceId,
  courseId,
  modules,
  isLoading,
  expandedModule,
  onToggleExpand,
  onCreateClick,
}: ModulesTabProps) {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <BookOpen className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-lg font-medium text-slate-900">아직 모듈이 없습니다</p>
        <p className="mt-1 text-slate-500">학습 내용을 구성하는 모듈을 만들어보세요</p>
        <Button className="mt-4" onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          모듈 만들기
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          새 모듈
        </Button>
      </div>
      <div className="space-y-4">
        {modules.map((module, index) => (
          <ModuleCard
            key={module.module_id}
            module={module}
            index={index + 1}
            workspaceId={workspaceId}
            courseId={courseId}
            isExpanded={expandedModule === module.module_id}
            onToggle={() =>
              onToggleExpand(expandedModule === module.module_id ? null : module.module_id)
            }
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// Module Card
// ==========================================

interface ModuleCardProps {
  module: Module;
  index: number;
  workspaceId: string;
  courseId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function ModuleCard({ module, index, workspaceId, courseId, isExpanded, onToggle }: ModuleCardProps) {
  return (
    <Card>
      <button onClick={onToggle} className="flex w-full items-center justify-between p-4 text-left">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-lg font-bold text-primary-700">
            {index}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{module.module_name}</h3>
            <p className="text-sm text-slate-500">
              {module.task_count}개 태스크 · {module.completed_task_count || 0}개 완료
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-2 w-32 rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-primary-500"
              style={{
                width: `${module.task_count ? ((module.completed_task_count || 0) / module.task_count) * 100 : 0}%`,
              }}
            />
          </div>
          <ChevronRight
            className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {isExpanded && module.tasks && module.tasks.length > 0 && (
        <div className="border-t border-slate-100 p-4">
          <div className="space-y-2">
            {module.tasks.map((task) => (
              <Link
                key={task.task_id}
                to={`/workspace/${workspaceId}/course/${courseId}/module/${module.module_id}/task/${task.task_id}`}
                className="flex items-center justify-between rounded-lg p-3 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <TaskStatusIcon status={task.status} />
                  <span className="font-medium text-slate-700">{task.task_name}</span>
                </div>
                <Badge
                  variant={
                    task.status === 'done'
                      ? 'success'
                      : task.status === 'doing'
                      ? 'primary'
                      : 'default'
                  }
                  size="sm"
                >
                  {TASK_STATUS[task.status]?.label || task.status}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function TaskStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'done':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'doing':
      return <Play className="h-5 w-5 text-primary-500" />;
    default:
      return <Clock className="h-5 w-5 text-slate-400" />;
  }
}

// ==========================================
// Teams Tab
// ==========================================

interface TeamsTabProps {
  workspaceId: string;
  courseId: string;
  teams: Team[];
  isLoading: boolean;
  onCreateClick: () => void;
}

function TeamsTab({ workspaceId, courseId, teams, isLoading, onCreateClick }: TeamsTabProps) {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Users className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-lg font-medium text-slate-900">아직 팀이 없습니다</p>
        <p className="mt-1 text-slate-500">참가자들이 협업할 팀을 만들어보세요</p>
        <Button className="mt-4" onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          팀 만들기
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          새 팀
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Link key={team.team_id} to={`/workspace/${workspaceId}/course/${courseId}/team/${team.team_id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <Card.Content className="p-4">
                <h3 className="mb-2 font-semibold text-slate-900">{team.team_name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Users className="h-4 w-4" />
                  <span>{team.member_count}명</span>
                </div>
              </Card.Content>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// Participants Tab
// ==========================================

interface ParticipantsTabProps {
  participants: CourseParticipant[];
  isLoading: boolean;
  onInviteClick: () => void;
}

function ParticipantsTab({ participants, isLoading, onInviteClick }: ParticipantsTabProps) {
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
          참가자 초대
        </Button>
      </div>
      <Card>
        <div className="divide-y divide-slate-100">
          {participants.map((participant) => (
            <div key={participant.user_id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-medium">
                  {participant.profile_image ? (
                    <img
                      src={participant.profile_image}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    participant.nick_name[0].toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{participant.nick_name}</p>
                  <p className="text-sm text-slate-500">{participant.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {participant.team_name && (
                  <Badge variant="outline" size="sm">
                    {participant.team_name}
                  </Badge>
                )}
                <Badge
                  variant={
                    participant.role === 'manager'
                      ? 'primary'
                      : participant.role === 'expert'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {participant.role === 'manager'
                    ? '매니저'
                    : participant.role === 'expert'
                    ? '전문가'
                    : '참가자'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
