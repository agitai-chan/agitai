import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Save, Send, History, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import {
  updateProduct,
  submitProduct,
  reviewProduct,
  getProductVersions,
} from '@/api/endpoints/task';
import { queryKeys } from '@/lib/queryClient';
import type { Product, TaskStatus, ReviewAction } from '@/api/types';
import { TASK_STATUS_LABELS } from '@/utils/constants';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface ProductTabProps {
  taskId: string;
  product: Product | null;
  status: TaskStatus;
}

export function ProductTab({ taskId, product, status }: ProductTabProps) {
  const [content, setContent] = useState(product?.product_content || '');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const queryClient = useQueryClient();

  const isEditable = status === 'Doing';
  const isReviewable = status === 'Review';
  const isDone = status === 'Done';

  const { data: versionsData } = useQuery({
    queryKey: queryKeys.product.versions(taskId),
    queryFn: () => getProductVersions(taskId),
    enabled: showVersionHistory,
  });

  const updateMutation = useMutation({
    mutationFn: () => updateProduct(taskId, { product_content: content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.product.detail(taskId) });
      toast.success('저장되었습니다.');
    },
    onError: () => toast.error('저장에 실패했습니다.'),
  });

  const submitMutation = useMutation({
    mutationFn: () => submitProduct(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.task.detail });
      toast.success('리뷰가 요청되었습니다.');
    },
    onError: () => toast.error('리뷰 요청에 실패했습니다.'),
  });

  const reviewMutation = useMutation({
    mutationFn: (data: { review_action: ReviewAction; feedback_comment?: string }) =>
      reviewProduct(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.task.detail });
      setShowReviewForm(false);
      toast.success('리뷰가 완료되었습니다.');
    },
    onError: () => toast.error('리뷰 처리에 실패했습니다.'),
  });

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Badge variant={status === 'Done' ? 'done' : status === 'Review' ? 'review' : 'doing'}>
            {TASK_STATUS_LABELS[status]}
          </Badge>
          {product?.current_version && (
            <span className="text-sm text-slate-500">버전 {product.current_version}</span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowVersionHistory(!showVersionHistory)}>
          <History className="mr-1 h-4 w-4" />
          버전 히스토리
        </Button>
      </div>

      {product?.review_result && (
        <Card className="border-l-4 border-l-primary-500 p-4">
          <div className="flex items-center gap-2">
            {product.review_result.action === 'approve' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {product.review_result.action === 'reject' && <XCircle className="h-5 w-5 text-red-500" />}
            {product.review_result.action === 'request_revision' && <RotateCcw className="h-5 w-5 text-amber-500" />}
            <span className="font-medium">
              {product.review_result.action === 'approve' && '승인됨'}
              {product.review_result.action === 'reject' && '반려됨'}
              {product.review_result.action === 'request_revision' && '수정 요청'}
            </span>
          </div>
          {product.review_result.feedback && (
            <p className="mt-2 text-sm text-slate-600">{product.review_result.feedback}</p>
          )}
        </Card>
      )}

      <div className="flex gap-4">
        <Card className="flex-1">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold">결과물</h2>
          </div>
          <div className="p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!isEditable}
              className="min-h-[400px] w-full rounded-lg border border-slate-300 p-4 text-sm focus:border-primary-500 focus:outline-none disabled:bg-slate-50"
              placeholder="결과물을 작성하세요..."
            />
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
            {isEditable && (
              <>
                <Button variant="outline" onClick={() => updateMutation.mutate()} isLoading={updateMutation.isPending}>
                  <Save className="mr-1 h-4 w-4" />저장
                </Button>
                <Button onClick={() => submitMutation.mutate()} isLoading={submitMutation.isPending} disabled={!content.trim()}>
                  <Send className="mr-1 h-4 w-4" />리뷰 요청
                </Button>
              </>
            )}
            {isReviewable && <Button onClick={() => setShowReviewForm(true)}>리뷰하기</Button>}
          </div>
        </Card>

        {showVersionHistory && versionsData && (
          <Card className="w-80">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="font-medium">버전 히스토리</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {versionsData.versions.map((v) => (
                <div key={v.version_id} className="border-b border-slate-100 p-4 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">v{v.version_number}</span>
                    <span className="text-xs text-slate-500">{format(new Date(v.created_at), 'PPp', { locale: ko })}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{v.editor.nick_name}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {showReviewForm && (
        <ReviewFormModal
          onClose={() => setShowReviewForm(false)}
          onSubmit={(data) => reviewMutation.mutate(data)}
          isLoading={reviewMutation.isPending}
        />
      )}
    </div>
  );
}

function ReviewFormModal({ onClose, onSubmit, isLoading }: {
  onClose: () => void;
  onSubmit: (data: { review_action: ReviewAction; feedback_comment?: string }) => void;
  isLoading: boolean;
}) {
  const [action, setAction] = useState<ReviewAction>('approve');
  const [feedback, setFeedback] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold">리뷰 작성</h3>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium">결정</label>
            <div className="flex gap-2">
              {(['approve', 'request_revision', 'reject'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAction(a)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-3 ${
                    action === a
                      ? a === 'approve' ? 'border-green-500 bg-green-50 text-green-700'
                        : a === 'request_revision' ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200'
                  }`}
                >
                  {a === 'approve' && <><CheckCircle className="h-5 w-5" />승인</>}
                  {a === 'request_revision' && <><RotateCcw className="h-5 w-5" />수정 요청</>}
                  {a === 'reject' && <><XCircle className="h-5 w-5" />반려</>}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">피드백</label>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full rounded-lg border border-slate-300 p-3 text-sm" rows={4} placeholder="피드백을 입력하세요..." />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>취소</Button>
          <Button onClick={() => onSubmit({ review_action: action, feedback_comment: feedback })} isLoading={isLoading}>제출</Button>
        </div>
      </Card>
    </div>
  );
}
