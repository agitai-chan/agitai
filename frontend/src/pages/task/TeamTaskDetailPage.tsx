import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, MessageSquare } from 'lucide-react';
import { Button, Tabs, Badge } from '@/components/ui';
import { TaskHeader } from '@/components/task/TaskHeader';
import { GuideTab } from '@/components/task/guide';
import { PromptTab } from '@/components/task/prompt';
import { ProductTab } from '@/components/task/product';
import { CommentPanel } from '@/components/comment';
import { getTeamTask } from '@/api/endpoints/team';
import { queryKeys } from '@/lib/queryClient';
import type { TabType } from '@/api/types';

export function TeamTaskDetailPage() {
  const { workspaceId, courseId, teamId, teamTaskId } = useParams<{
    workspaceId: string;
    courseId: string;
    teamId: string;
    teamTaskId: string;
  }>();
  const [activeTab, setActiveTab] = useState<TabType>('guide');
  const [showComments, setShowComments] = useState(false);

  const { data: task, isLoading } = useQuery({
    queryKey: queryKeys.team.task(teamTaskId!),
    queryFn: () => getTeamTask(workspaceId!, courseId!, teamId!, teamTaskId!),
    enabled: !!teamTaskId,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg font-medium text-slate-900">태스크를 찾을 수 없습니다</p>
        <Link
          to={`/workspace/${workspaceId}/course/${courseId}/team/${teamId}`}
          className="mt-2 text-primary-600 hover:underline"
        >
          팀으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
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
          <Link to={`/workspace/${workspaceId}/course/${courseId}/team/${teamId}`} className="hover:text-slate-900">
            팀
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-slate-900">{task.task_name}</span>
        </nav>
      </div>

      {/* Task Header */}
      <TaskHeader
        taskName={task.task_name}
        status={task.status}
        moduleName={task.module_name}
        teamName={task.team_name}
      />

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6">
        <Tabs value={activeTab} onChange={(v) => setActiveTab(v as TabType)}>
          <Tabs.List>
            <Tabs.Tab value="guide">Guide</Tabs.Tab>
            <Tabs.Tab value="prompt">Prompt</Tabs.Tab>
            <Tabs.Tab value="product">Product</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <Button
          variant={showComments ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          코멘트
        </Button>
      </div>

      {/* Content */}
      <div className={`transition-all ${showComments ? 'mr-80' : ''}`}>
        <div className="p-6">
          {activeTab === 'guide' && (
            <GuideTab taskId={teamTaskId!} isTeamTask />
          )}
          {activeTab === 'prompt' && (
            <PromptTab taskId={teamTaskId!} teamId={teamId} isTeamTask />
          )}
          {activeTab === 'product' && (
            <ProductTab taskId={teamTaskId!} isTeamTask />
          )}
        </div>
      </div>

      {/* Comment Panel */}
      <CommentPanel
        taskId={teamTaskId!}
        tabType={activeTab}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  );
}
