import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Edit2, Save, X, Paperclip } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { updateGuide } from '@/api/endpoints/task';
import { queryKeys } from '@/lib/queryClient';
import type { Guide } from '@/api/types';
import { useAuthStore } from '@/stores';
import { hasCoursePermission } from '@/utils/permissions';
import toast from 'react-hot-toast';

interface GuideTabProps {
  taskId: string;
  guide: Guide | null;
}

export function GuideTab({ taskId, guide }: GuideTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(guide?.guide_content || '');
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // 편집 권한 확인 (Manager/Expert만 가능)
  // 실제로는 코스에서 역할을 가져와야 함
  const canEdit = true; // hasCoursePermission(courseRole, 'guide:edit');

  const updateMutation = useMutation({
    mutationFn: (data: { guide_content: string }) => updateGuide(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guide.detail(taskId) });
      setIsEditing(false);
      toast.success('가이드가 저장되었습니다.');
    },
    onError: () => {
      toast.error('가이드 저장에 실패했습니다.');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ guide_content: content });
  };

  const handleCancel = () => {
    setContent(guide?.guide_content || '');
    setIsEditing(false);
  };

  return (
    <Card className="mt-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">가이드</h2>
          {guide?.last_editor && (
            <p className="text-sm text-slate-500">
              마지막 수정: {guide.last_editor.nick_name}
            </p>
          )}
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                >
                  <X className="mr-1 h-4 w-4" />
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  isLoading={updateMutation.isPending}
                >
                  <Save className="mr-1 h-4 w-4" />
                  저장
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-1 h-4 w-4" />
                편집
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] w-full rounded-lg border border-slate-300 p-4 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="마크다운으로 가이드를 작성하세요..."
          />
        ) : guide?.guide_content ? (
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {guide.guide_content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <Edit2 className="h-8 w-8 text-slate-400" />
            </div>
            <p className="mt-4 text-lg font-medium text-slate-900">
              아직 가이드가 없습니다
            </p>
            <p className="mt-2 text-slate-500">
              {canEdit
                ? '편집 버튼을 눌러 가이드를 작성해보세요.'
                : 'Manager 또는 Expert가 가이드를 작성할 수 있습니다.'}
            </p>
          </div>
        )}
      </div>

      {/* Attachments */}
      {guide?.attachments && guide.attachments.length > 0 && (
        <div className="border-t border-slate-200 px-6 py-4">
          <h3 className="mb-3 text-sm font-medium text-slate-700">첨부파일</h3>
          <div className="flex flex-wrap gap-2">
            {guide.attachments.map((attachment) => (
              <a
                key={attachment.attachment_id}
                href={attachment.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <Paperclip className="h-4 w-4 text-slate-400" />
                <span>{attachment.file_name}</span>
                <span className="text-slate-400">
                  ({Math.round(attachment.file_size / 1024)}KB)
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
