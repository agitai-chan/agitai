import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Trash2, Copy, Check, RefreshCw, Calendar } from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';
import {
  getCourse,
  updateCourse,
  deleteCourse,
  getCourseInviteLink,
  regenerateCourseInviteLink,
} from '@/api/endpoints/course';
import { queryKeys } from '@/lib/queryClient';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const settingsSchema = z.object({
  course_name: z.string().min(1, '코스 이름을 입력해주세요.'),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed']),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function CourseSettingsPage() {
  const { workspaceId, courseId } = useParams<{ workspaceId: string; courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  // 코스 상세 조회
  const { data: course, isLoading } = useQuery({
    queryKey: queryKeys.course.detail(workspaceId!, courseId!),
    queryFn: () => getCourse(workspaceId!, courseId!),
    enabled: !!workspaceId && !!courseId,
  });

  // 초대 링크 조회
  const { data: inviteData } = useQuery({
    queryKey: queryKeys.course.invite(courseId!),
    queryFn: () => getCourseInviteLink(workspaceId!, courseId!),
    enabled: !!workspaceId && !!courseId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: course
      ? {
          course_name: course.course_name,
          description: course.description || '',
          start_date: course.start_date || '',
          end_date: course.end_date || '',
          status: course.status as 'draft' | 'active' | 'completed',
        }
      : undefined,
  });

  // 업데이트
  const updateMutation = useMutation({
    mutationFn: (data: SettingsFormData) => updateCourse(workspaceId!, courseId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course.detail(workspaceId!, courseId!) });
      toast.success('설정이 저장되었습니다.');
    },
    onError: () => {
      toast.error('저장에 실패했습니다.');
    },
  });

  // 삭제
  const deleteMutation = useMutation({
    mutationFn: () => deleteCourse(workspaceId!, courseId!),
    onSuccess: () => {
      toast.success('코스가 삭제되었습니다.');
      navigate(`/workspace/${workspaceId}`);
    },
    onError: () => {
      toast.error('삭제에 실패했습니다.');
    },
  });

  // 초대 링크 재생성
  const regenerateMutation = useMutation({
    mutationFn: () => regenerateCourseInviteLink(workspaceId!, courseId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course.invite(courseId!) });
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
      confirm('정말 이 코스를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없으며, 모든 모듈과 데이터가 삭제됩니다.')
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

  if (!course) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg font-medium text-slate-900">코스를 찾을 수 없습니다</p>
      </div>
    );
  }

  const isManager = course.user_role === 'manager';

  return (
    <div className="animate-fade-in p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/workspace/${workspaceId}/course/${courseId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          코스로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">코스 설정</h1>
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
                label="코스 이름"
                error={errors.course_name?.message}
                disabled={!isManager}
                {...register('course_name')}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">설명</label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-primary-500 focus:outline-none disabled:bg-slate-50"
                  rows={3}
                  placeholder="코스에 대한 설명을 입력하세요"
                  disabled={!isManager}
                  {...register('description')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="date"
                  label="시작일"
                  disabled={!isManager}
                  {...register('start_date')}
                />
                <Input
                  type="date"
                  label="종료일"
                  disabled={!isManager}
                  {...register('end_date')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">상태</label>
                <select
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-primary-500 focus:outline-none disabled:bg-slate-50"
                  disabled={!isManager}
                  {...register('status')}
                >
                  <option value="draft">준비 중</option>
                  <option value="active">진행 중</option>
                  <option value="completed">완료</option>
                </select>
              </div>

              {isManager && (
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
            <Card.Title>참가자 초대 링크</Card.Title>
            <Card.Description>이 링크를 공유하여 새 참가자를 초대할 수 있습니다</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex gap-2">
              <div className="flex-1 truncate rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600">
                {inviteData?.invite_link || '초대 링크를 불러오는 중...'}
              </div>
              <Button variant="outline" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              {isManager && (
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
        {isManager && (
          <Card className="border-red-200">
            <Card.Header>
              <Card.Title className="text-red-600">위험 영역</Card.Title>
              <Card.Description>이 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.</Card.Description>
            </Card.Header>
            <Card.Content>
              <Button variant="danger" onClick={handleDelete} isLoading={deleteMutation.isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                코스 삭제
              </Button>
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
}
