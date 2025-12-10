import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { createCourse } from '@/api/endpoints/course';
import { queryKeys } from '@/lib/queryClient';
import toast from 'react-hot-toast';

const createSchema = z.object({
  course_name: z.string().min(1, '코스 이름을 입력해주세요.'),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;

interface CreateCourseModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCourseModal({ workspaceId, isOpen, onClose }: CreateCourseModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateFormData) => createCourse(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course.list(workspaceId) });
      toast.success('코스가 생성되었습니다.');
      handleClose();
    },
    onError: () => {
      toast.error('코스 생성에 실패했습니다.');
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">새 코스</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
          <div className="space-y-4 p-6">
            <Input
              label="코스 이름"
              placeholder="예: AI 리터러시 기초"
              error={errors.course_name?.message}
              {...register('course_name')}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">설명 (선택)</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-primary-500 focus:outline-none"
                rows={3}
                placeholder="코스에 대한 설명을 입력하세요"
                {...register('description')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input type="date" label="시작일 (선택)" {...register('start_date')} />
              <Input type="date" label="종료일 (선택)" {...register('end_date')} />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
            <Button type="button" variant="ghost" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              생성
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
