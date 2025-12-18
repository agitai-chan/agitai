import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Star, Users, BookOpen, MoreHorizontal, Settings, Trash2 } from 'lucide-react';
import { Button, Input, Badge, Card } from '@/components/ui';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { listWorkspaces, toggleWorkspaceStar, deleteWorkspace } from '@/api/endpoints/workspace';
import { queryKeys } from '@/lib/queryClient';
import type { Workspace } from '@/api/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';

export function WorkspaceListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // 워크스페이스 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.workspace.list(),
    queryFn: () => listWorkspaces(),
  });

  // 즐겨찾기 토글
  const starMutation = useMutation({
    mutationFn: toggleWorkspaceStar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.list() });
    },
  });

  // 삭제
  const deleteMutation = useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.list() });
      toast.success('워크스페이스가 삭제되었습니다.');
    },
    onError: () => {
      toast.error('삭제에 실패했습니다.');
    },
  });

  const workspaces = data || [];
  const filteredWorkspaces = workspaces.filter((w) =>
    w.workspace_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const starredWorkspaces = filteredWorkspaces.filter((w) => w.is_starred);
  const otherWorkspaces = filteredWorkspaces.filter((w) => !w.is_starred);

  const handleDelete = (workspaceId: string) => {
    if (confirm('정말 이 워크스페이스를 삭제하시겠습니까?')) {
      deleteMutation.mutate(workspaceId);
    }
    setMenuOpen(null);
  };

  return (
    <div className="animate-fade-in p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">워크스페이스</h1>
          <p className="mt-1 text-slate-500">팀과 함께 학습 공간을 만들어보세요</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          새 워크스페이스
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="워크스페이스 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-lg font-medium text-slate-900">
            {searchQuery ? '검색 결과가 없습니다' : '아직 워크스페이스가 없습니다'}
          </p>
          <p className="mt-1 text-slate-500">
            {searchQuery ? '다른 검색어로 시도해보세요' : '첫 번째 워크스페이스를 만들어보세요'}
          </p>
          {!searchQuery && (
            <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              워크스페이스 만들기
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Starred */}
          {starredWorkspaces.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                즐겨찾기
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {starredWorkspaces.map((workspace) => (
                  <WorkspaceCard
                    key={workspace.workspace_id}
                    workspace={workspace}
                    menuOpen={menuOpen === workspace.workspace_id}
                    onMenuToggle={() =>
                      setMenuOpen(menuOpen === workspace.workspace_id ? null : workspace.workspace_id)
                    }
                    onStar={() => starMutation.mutate(workspace.workspace_id)}
                    onDelete={() => handleDelete(workspace.workspace_id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Workspaces */}
          {otherWorkspaces.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold text-slate-600">전체 워크스페이스</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {otherWorkspaces.map((workspace) => (
                  <WorkspaceCard
                    key={workspace.workspace_id}
                    workspace={workspace}
                    menuOpen={menuOpen === workspace.workspace_id}
                    onMenuToggle={() =>
                      setMenuOpen(menuOpen === workspace.workspace_id ? null : workspace.workspace_id)
                    }
                    onStar={() => starMutation.mutate(workspace.workspace_id)}
                    onDelete={() => handleDelete(workspace.workspace_id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Create Modal */}
      <CreateWorkspaceModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}

// ==========================================
// Workspace Card
// ==========================================

interface WorkspaceCardProps {
  workspace: Workspace;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onStar: () => void;
  onDelete: () => void;
}

function WorkspaceCard({ workspace, menuOpen, onMenuToggle, onStar, onDelete }: WorkspaceCardProps) {
  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <Link to={`/workspace/${workspace.workspace_id}`}>
        <Card.Content className="p-4">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white"
              style={{ backgroundColor: workspace.workspace_color || '#6366f1' }}
            >
              {workspace.workspace_name[0].toUpperCase()}
            </div>
            <Badge variant={workspace.user_role === 'owner' ? 'primary' : 'default'} size="sm">
              {workspace.user_role === 'owner' ? '소유자' : '멤버'}
            </Badge>
          </div>

          {/* Name & Description */}
          <h3 className="mb-1 font-semibold text-slate-900">{workspace.workspace_name}</h3>
          <p className="mb-3 line-clamp-2 text-sm text-slate-500">
            {workspace.description || '설명이 없습니다'}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {workspace.member_count}명
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {workspace.course_count}개 코스
            </span>
          </div>
        </Card.Content>
      </Link>

      {/* Actions */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.preventDefault();
            onStar();
          }}
          className="rounded p-1.5 hover:bg-slate-100"
        >
          <Star
            className={`h-4 w-4 ${
              workspace.is_starred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
            }`}
          />
        </button>
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              onMenuToggle();
            }}
            className="rounded p-1.5 hover:bg-slate-100"
          >
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border bg-white py-1 shadow-lg">
              <Link
                to={`/workspace/${workspace.workspace_id}/settings`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                설정
              </Link>
              {workspace.user_role === 'owner' && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete();
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
