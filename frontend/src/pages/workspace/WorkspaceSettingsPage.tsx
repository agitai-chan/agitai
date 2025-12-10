import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Trash2, Copy, Check, RefreshCw } from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';
import {
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceInviteLink,
  regenerateInviteLink,
} from '@/api/endpoints/workspace';
import { queryKeys } from '@/lib/queryClient';
import toast from 'react-hot-toast';

const settingsSchema = z.object({
  workspace_name: z.string().min(1, '워크스페이스 이름을 입력해주세요.'),
  description: z.string().optional(),
  workspace_color: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const COLORS = [
  '#6366f1', // Primary
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

export function WorkspaceSettingsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  // 워크스페이스 상세 조회
  const { data: workspace, isLoading } = useQuery({
    queryKey: queryKeys.workspace.detail(workspaceId!),
    queryFn: () => getWorkspace(workspaceId!),
    enabled: !!workspaceId,
  });

  // 초대 링크 조회
  const { data: inviteData } = useQuery({
    queryKey: queryKeys.workspace.invite(workspaceId!),
    queryFn: () => getWorkspaceInviteLink(workspaceId!),
    enabled: !!workspaceId,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: workspace
      ? {
          workspace_name: workspace.workspace_name,
          description: workspace.description || '',
          workspace_color: workspace.workspace_color || '#6366f1',
        }
      : undefined,
  });

  const selectedColor = watch('workspace_color');

  // 업데이트
  const updateMutation = useMutation({
    mutationFn: (data: SettingsFormData) => updateWorkspace(workspaceId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.detail(workspaceId!) });
      toast.success('설정이 저장되었습니다.');
    },
    onError: () => {
      toast.error('저장에 실패했습니다.');
    },
  });

  // 삭제
  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkspace(workspaceId!),
    onSuccess: () => {
      toast.success('워크스페이스가 삭제되었습니다.');
      navigate('/workspaces');
    },
    onError: () => {
      toast.error('삭제에 실패했습니다.');
    },
  });

  // 초대 링크 재생성
  const regenerateMutation = useMutation({
    mutationFn: () => regenerateInviteLink(workspaceId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.invite(workspaceId!) });
      toast.success('초대 링크가 재생성되었습니다.');
    },
  });

  const handleCopyLink = () => {
    if (inviteData?.invite_link) {
      navigator.clipboard.writeText(inviteData.invite_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('초대 링크가 복사되었습니다.');
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        '정말 이 워크스페이스를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없으며, 모든 코스와 데이터가 삭제됩니다.'
      )
    ) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
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
      </div>
    );
  }

  const isOwner = workspace.user_role === 'owner';

  return (
    <div className="animate-fade-in p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/workspace/${workspaceId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          워크스페이스로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">워크스페이스 설정</h1>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* General Settings */}
        <Card>
          <Card.Header>
            <Card.Title>일반 설정</Card.Title>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
              <Input
                label="워크스페이스 이름"
                error={errors.workspace_name?.message}
                disabled={!isOwner}
                {...register('workspace_name')}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">설명</label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-primary-500 focus:outline-none disabled:bg-slate-50"
                  rows={3}
                  placeholder="워크스페이스에 대한 설명을 입력하세요"
                  disabled={!isOwner}
                  {...register('description')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">테마 색상</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => isOwner && setValue('workspace_color', color, { shouldDirty: true })}
                      className={`h-8 w-8 rounded-full transition-transform ${
                        selectedColor === color ? 'scale-110 ring-2 ring-offset-2' : ''
                      } ${!isOwner ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color, ringColor: color }}
                    />
                  ))}
                </div>
              </div>

              {isOwner && (
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={!isDirty} isLoading={updateMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </Button>
                </div>
              )}
            </form>
          </Card.Content>
        </Card>

        {/* Invite Link */}
        <Card>
          <Card.Header>
            <Card.Title>초대 링크</Card.Title>
            <Card.Description>이 링크를 공유하여 새 멤버를 초대할 수 있습니다</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex gap-2">
              <div className="flex-1 truncate rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600">
                {inviteData?.invite_link || '초대 링크를 불러오는 중...'}
              </div>
              <Button variant="outline" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              {isOwner && (
                <Button
                  variant="ghost"
                  onClick={() => regenerateMutation.mutate()}
                  isLoading={regenerateMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Danger Zone */}
        {isOwner && (
          <Card className="border-red-200">
            <Card.Header>
              <Card.Title className="text-red-600">위험 영역</Card.Title>
              <Card.Description>
                이 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                워크스페이스 삭제
              </Button>
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
}
