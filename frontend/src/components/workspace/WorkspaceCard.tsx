import { Link } from 'react-router-dom';
import { Star, Users, BookOpen, MoreHorizontal } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import type { Workspace } from '@/api/types';
import { cn } from '@/utils/cn';

interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link to={`/workspace/${workspace.workspace_id}`}>
      <Card className="group h-full cursor-pointer transition-all hover:border-primary-300 hover:shadow-lg">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {workspace.logo_image ? (
                <img
                  src={workspace.logo_image}
                  alt={workspace.name}
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-lg font-bold text-white">
                  {workspace.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-primary-600">
                  {workspace.name}
                </h3>
                <Badge
                  variant={workspace.my_role === 'Owner' ? 'owner' : 'default'}
                  size="sm"
                >
                  {workspace.my_role}
                </Badge>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                // TODO: Toggle star
              }}
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                workspace.is_starred
                  ? 'text-amber-500'
                  : 'text-slate-300 hover:text-amber-500'
              )}
            >
              <Star
                className="h-5 w-5"
                fill={workspace.is_starred ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Description */}
          {workspace.description && (
            <p className="mt-3 line-clamp-2 text-sm text-slate-500">
              {workspace.description}
            </p>
          )}

          {/* Stats */}
          <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{workspace.member_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{workspace.course_count} 코스</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
