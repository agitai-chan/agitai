import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Badge, Button } from '@/components/ui';
import { GuideTab } from '@/components/task/guide/GuideTab';
import { PromptTab } from '@/components/task/prompt/PromptTab';
import { ProductTab } from '@/components/task/product/ProductTab';
import { CommentPanel } from '@/components/comment/CommentPanel';
import { TaskHeader } from '@/components/task/TaskHeader';
import { useUIStore } from '@/stores';
import { getTaskDetail } from '@/api/endpoints/task';
import { queryKeys } from '@/lib/queryClient';
import { cn } from '@/utils/cn';

export function TaskDetailPage() {
  const { courseId, moduleId, taskId } = useParams<{
    workspaceId: string;
    courseId: string;
    moduleId: string;
    taskId: string;
  }>();
  
  const [activeTab, setActiveTab] = useState('guide');
  const { commentPanelOpen, toggleCommentPanel } = useUIStore();

  // 태스크 상세 조회
  const { data: task, isLoading, error } = useQuery({
    queryKey: queryKeys.task.detail(courseId!, moduleId!, taskId!),
    queryFn: () => getTaskDetail(courseId!, moduleId!, taskId!),
    enabled: !!courseId && !!moduleId && !!taskId,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="text-lg font-medium text-slate-900">태스크를 찾을 수 없습니다</p>
        <p className="mt-2 text-slate-500">요청하신 태스크가 존재하지 않거나 접근 권한이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className={cn('flex-1 transition-all', commentPanelOpen ? 'mr-80' : 'mr-0')}>
        {/* Task Header */}
        <TaskHeader task={task} />

        {/* 3-Tab Structure */}
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="guide">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="guide">
                  Guide
                  <span className="ml-1.5 text-slate-400">가이드</span>
                </TabsTrigger>
                <TabsTrigger value="prompt">
                  Prompt
                  <span className="ml-1.5 text-slate-400">프롬프트</span>
                </TabsTrigger>
                <TabsTrigger value="product">
                  Product
                  <span className="ml-1.5 text-slate-400">결과물</span>
                </TabsTrigger>
              </TabsList>

              {/* Comment Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCommentPanel}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                코멘트
                {task.comment_count > 0 && (
                  <Badge variant="primary" size="sm">
                    {task.comment_count}
                  </Badge>
                )}
                {commentPanelOpen ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Guide Tab */}
            <TabsContent value="guide">
              <GuideTab taskId={taskId!} guide={task.guide} />
            </TabsContent>

            {/* Prompt Tab */}
            <TabsContent value="prompt">
              <PromptTab taskId={taskId!} />
            </TabsContent>

            {/* Product Tab */}
            <TabsContent value="product">
              <ProductTab taskId={taskId!} product={task.product} status={task.status} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Comment Panel (Right Side) */}
      <CommentPanel
        taskId={taskId!}
        tabType={activeTab as 'guide' | 'prompt' | 'product'}
        isOpen={commentPanelOpen}
        onClose={() => toggleCommentPanel()}
      />
    </div>
  );
}
