import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Calendar, User, MoreHorizontal } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { TaskDetail, TaskStatus } from '@/api/types';
import { TASK_STATUS_LABELS } from '@/utils/constants';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TaskHeaderProps {
  task: TaskDetail;
}

const STATUS_BADGE_VARIANT: Record<TaskStatus, 'todo' | 'doing' | 'review' | 'done'> = {
  Todo: 'todo',
  Doing: 'doing',
  Review: 'review',
  Done: 'done',
};

export function TaskHeader({ task }: TaskHeaderProps) {
  const { workspaceId, courseId, moduleId } = useParams();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Link
          to={`/workspace/${workspaceId}/course/${courseId}`}
          className="hover:text-primary-600"
        >
          코스
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          to={`/workspace/${workspaceId}/course/${courseId}`}
          className="hover:text-primary-600"
        >
          모듈
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-900">{task.name}</span>
      </nav>

      {/* Title & Status */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{task.name}</h1>
            <Badge variant={STATUS_BADGE_VARIANT[task.status]} size="lg">
              {TASK_STATUS_LABELS[task.status]}
            </Badge>
          </div>
          
          {task.description && (
            <p className="mt-2 text-slate-600">{task.description}</p>
          )}
        </div>

        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Meta Info */}
      <div className="mt-4 flex items-center gap-6 text-sm text-slate-500">
        {task.assignee_role && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>담당: {task.assignee_role}</span>
          </div>
        )}
        
        {task.due_date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              마감: {format(new Date(task.due_date), 'PPP', { locale: ko })}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span>
            생성: {format(new Date(task.created_at), 'PPP', { locale: ko })}
          </span>
        </div>
      </div>

      {/* Status Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          {(['Todo', 'Doing', 'Review', 'Done'] as TaskStatus[]).map((status, index) => {
            const isActive = status === task.status;
            const isPast =
              ['Todo', 'Doing', 'Review', 'Done'].indexOf(task.status) >
              ['Todo', 'Doing', 'Review', 'Done'].indexOf(status);

            return (
              <div key={status} className="flex flex-1 items-center">
                <div
                  className={`flex h-8 flex-1 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : isPast
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {TASK_STATUS_LABELS[status]}
                </div>
                {index < 3 && (
                  <ChevronRight
                    className={`mx-1 h-4 w-4 ${
                      isPast ? 'text-green-500' : 'text-slate-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
