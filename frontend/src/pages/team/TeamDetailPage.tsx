import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  Users,
  BookOpen,
  Settings,
  CheckCircle,
  Clock,
  Play,
} from 'lucide-react';
import { Button, Badge, Card, Tabs } from '@/components/ui';
import { getTeam, listTeamMembers, listTeamTasks } from '@/api/endpoints/team';
import { queryKeys } from '@/lib/queryClient';
import type { TeamMember, TeamTask } from '@/api/types';
import { TASK_STATUS, TEAM_ROLES } from '@/utils/constants';

export function TeamDetailPage() {
  const { workspaceId, courseId, teamId } = useParams<{
    workspaceId: string;
    courseId: string;
    teamId: string;
  }>();
  const [activeTab, setActiveTab] = useState('tasks');

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: queryKeys.team.detail(teamId!),
    queryFn: () => getTeam(workspaceId!, courseId!, teamId!),
    enabled: !!teamId,
  });

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: queryKeys.team.members(teamId!),
    queryFn: () => listTeamMembers(workspaceId!, courseId!, teamId!),
    enabled: !!teamId && activeTab === 'members',
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: queryKeys.team.tasks(teamId!),
    queryFn: () => listTeamTasks(workspaceId!, courseId!, teamId!),
    enabled: !!teamId && activeTab === 'tasks',
  });

  if (teamLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg font-medium text-slate-900">팀을 찾을 수 없습니다</p>
        <Link
          to={`/workspace/${workspaceId}/course/${courseId}`}
          className="mt-2 text-primary-600 hover:underline"
        >
          코스로 돌아가기
        </Link>
      </div>
    );
  }

  const members = membersData?.members || [];
  const tasks = tasksData?.tasks || [];

  return (
    <div className="animate-fade-in">
      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link to={`/workspace/${workspaceId}`} className="hover:text-slate-900">
            워크스페이스
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/workspace/${workspaceId}/course/${courseId}`} className="hover:text-slate-900">
            코스
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-slate-900">{team.team_name}</span>
        </nav>
      </div>

      <div className="border-b border-slate-200 bg-white px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{team.team_name}</h1>
            <p className="mt-1 text-slate-500">{team.description || '팀 설명이 없습니다'}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                멤버 {team.member_count}명
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                태스크 {tasks.length}개
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white px-6">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="tasks">
              <BookOpen className="mr-2 h-4 w-4" />
              태스크
            </Tabs.Tab>
            <Tabs.Tab value="members">
              <Users className="mr-2 h-4 w-4" />
              멤버
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>

      <div className="p-6">
        {activeTab === 'tasks' && (
          <TasksSection
            workspaceId={workspaceId!}
            courseId={courseId!}
            teamId={teamId!}
            tasks={tasks}
            isLoading={tasksLoading}
          />
        )}
        {activeTab === 'members' && (
          <MembersSection members={members} isLoading={membersLoading} />
        )}
      </div>
    </div>
  );
}

interface TasksSectionProps {
  workspaceId: string;
  courseId: string;
  teamId: string;
  tasks: TeamTask[];
  isLoading: boolean;
}

function TasksSection({ workspaceId, courseId, teamId, tasks, isLoading }: TasksSectionProps) {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <BookOpen className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-lg font-medium text-slate-900">아직 태스크가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Link
          key={task.team_task_id}
          to={`/workspace/${workspaceId}/course/${courseId}/team/${teamId}/task/${task.team_task_id}`}
        >
          <Card className="transition-shadow hover:shadow-md">
            <Card.Content className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {task.status === 'done' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {task.status === 'doing' && <Play className="h-5 w-5 text-primary-500" />}
                {task.status !== 'done' && task.status !== 'doing' && <Clock className="h-5 w-5 text-slate-400" />}
                <div>
                  <h3 className="font-medium text-slate-900">{task.task_name}</h3>
                  <p className="text-sm text-slate-500">{task.module_name}</p>
                </div>
              </div>
              <Badge
                variant={task.status === 'done' ? 'success' : task.status === 'doing' ? 'primary' : 'default'}
              >
                {TASK_STATUS[task.status]?.label || task.status}
              </Badge>
            </Card.Content>
          </Card>
        </Link>
      ))}
    </div>
  );
}

interface MembersSectionProps {
  members: TeamMember[];
  isLoading: boolean;
}

function MembersSection({ members, isLoading }: MembersSectionProps) {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <Card>
      <div className="divide-y divide-slate-100">
        {members.map((member) => (
          <div key={member.user_id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-medium">
                {member.profile_image ? (
                  <img src={member.profile_image} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  member.nick_name[0].toUpperCase()
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900">{member.nick_name}</p>
                <p className="text-sm text-slate-500">{member.email}</p>
              </div>
            </div>
            <Badge variant={member.team_role ? 'primary' : 'default'}>
              {TEAM_ROLES[member.team_role] || member.team_role || '멤버'}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
