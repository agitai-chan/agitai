import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Building2, BookOpen, Users, TrendingUp } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { WorkspaceCard } from '@/components/workspace/WorkspaceCard';
import { listWorkspaces } from '@/api/endpoints/workspace';
import { queryKeys } from '@/lib/queryClient';
import { useAuthStore } from '@/stores';

export function DashboardPage() {
  const { user } = useAuthStore();

  const { data: workspacesData, isLoading } = useQuery({
    queryKey: queryKeys.workspace.list({ sort_by: 'last_accessed', limit: 6 }),
    queryFn: () => listWorkspaces({ sort_by: 'last_accessed', limit: 6 }),
  });

  const workspaces = workspacesData?.workspaces || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
        <h1 className="text-2xl font-bold">
          안녕하세요, {user?.nick_name}님! 👋
        </h1>
        <p className="mt-2 text-primary-100">
          오늘도 AGIT과 함께 성장하는 하루 되세요.
        </p>
        <div className="mt-6 flex gap-4">
          <Link to="/workspaces">
            <Button variant="secondary">
              <Building2 className="mr-2 h-4 w-4" />
              워크스페이스 보기
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{workspaces.length}</p>
              <p className="text-sm text-slate-500">워크스페이스</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-slate-500">참여 중인 코스</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-slate-500">소속 팀</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-sm text-slate-500">평균 진행률</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workspaces */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">최근 워크스페이스</h2>
          <Link to="/workspaces">
            <Button variant="ghost" size="sm">
              전체 보기
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-40 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-lg font-medium">아직 워크스페이스가 없습니다</p>
            <p className="mt-2 text-slate-500">
              새로운 워크스페이스를 만들거나 초대를 받아보세요.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <WorkspaceCard key={workspace.workspace_id} workspace={workspace} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">최근 활동</h2>
        <Card>
          <CardContent className="divide-y p-0">
            {[
              { action: '태스크 완료', target: '시장 분석 리포트', time: '10분 전' },
              { action: '코멘트 작성', target: '비즈니스 모델 캔버스', time: '1시간 전' },
              { action: '프롬프트 실행', target: 'AI 마케팅 전략', time: '2시간 전' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-slate-500">{activity.target}</p>
                </div>
                <span className="text-sm text-slate-400">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
