import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { createModule } from '@/api/endpoints/module';
import { queryKeys } from '@/lib/queryClient';
import toast from 'react-hot-toast';

const createSchema = z.object({
  module_name: z.string().min(1, '모듈 이름을 입력해주세요.'),
  description: z.string().optional(),
  order_index: z.number().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;

interface CreateModuleModalProps {
  workspaceId: string;
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateModuleModal({ workspaceId, courseId, isOpen, onClose }: CreateModuleModalProps) {
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
    mutationFn: (data: CreateFormData) => createModule(workspaceId, courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.module.list(courseId) });
      toast.success('모듈이 생성되었습니다.');
      handleClose();
    },
    onError: () => {
      toast.error('모듈 생성에 실패했습니다.');
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
          <h2 className="text-lg font-semibold">새 모듈</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
          <div className="space-y-4 p-6">
            <Input
              label="모듈 이름"
              placeholder="예: 1주차 - AI 기초 개념"
              error={errors.module_name?.message}
              {...register('module_name')}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">설명 (선택)</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-primary-500 focus:outline-none"
                rows={3}
                placeholder="모듈에 대한 설명을 입력하세요"
                {...register('description')}
              />
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
