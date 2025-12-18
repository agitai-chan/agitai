import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { createWorkspace } from '@/api/endpoints/workspace';
import { queryKeys } from '@/lib/queryClient';
import toast from 'react-hot-toast';

const createSchema = z.object({
  name: z.string().min(1, '워크스페이스 이름을 입력해주세요.'),
  description: z.string().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
];

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const queryClient = useQueryClient();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {},
  });

  const createMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.list() });
      toast.success('워크스페이스가 생성되었습니다.');
      handleClose();
    },
    onError: () => {
      toast.error('워크스페이스 생성에 실패했습니다.');
    },
  });

  const handleClose = () => {
    reset();
    setSelectedColor(COLORS[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">새 워크스페이스</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit((data) =>
            createMutation.mutate(data)
          )}
        >
          <div className="space-y-4 p-6">
            <Input
              label="워크스페이스 이름"
              placeholder="예: 스타트업 부트캠프"
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">설명 (선택)</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-primary-500 focus:outline-none"
                rows={3}
                placeholder="워크스페이스에 대한 설명을 입력하세요"
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
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-full transition-transform hover:scale-105 ${
                      selectedColor === color ? 'scale-110 ring-2 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color, ringColor: color }}
                  />
                ))}
              </div>
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
