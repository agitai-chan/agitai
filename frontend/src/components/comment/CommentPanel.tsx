import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Send, MessageSquare } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { listComments, createComment } from '@/api/endpoints/task';
import { queryKeys } from '@/lib/queryClient';
import { useAuthStore } from '@/stores';
import type { TabType, Comment } from '@/api/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface CommentPanelProps {
  taskId: string;
  tabType: TabType;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentPanel({ taskId, tabType, isOpen, onClose }: CommentPanelProps) {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.comment.list(taskId, { tab_type: tabType }),
    queryFn: () => listComments(taskId, { tab_type: tabType }),
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createComment(taskId, {
        tab_type: tabType,
        comment_text: newComment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comment.list(taskId) });
      setNewComment('');
      toast.success('코멘트가 등록되었습니다.');
    },
    onError: () => toast.error('코멘트 등록에 실패했습니다.'),
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    createMutation.mutate();
  };

  const comments = data?.comments || [];

  return (
    <div
      className={cn(
        'fixed right-0 top-16 z-30 h-[calc(100vh-64px)] w-80 border-l border-slate-200 bg-white transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold">코멘트</h3>
            <Badge variant="default" size="sm">
              {comments.length}
            </Badge>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Filter */}
        <div className="border-b border-slate-200 px-4 py-2">
          <span className="text-sm text-slate-500">
            현재 탭: <span className="font-medium text-slate-700">{tabType}</span>
          </span>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-center">
              <MessageSquare className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">아직 코멘트가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.comment_id} comment={comment} currentUserId={user?.user_id} />
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="코멘트를 입력하세요..."
              className="flex-1 resize-none rounded-lg border border-slate-300 p-2 text-sm focus:border-primary-500 focus:outline-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!newComment.trim() || createMutation.isPending}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, currentUserId }: { comment: Comment; currentUserId?: string }) {
  const isOwn = comment.author.user_id === currentUserId;

  return (
    <div className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-medium">
        {comment.author.profile_image ? (
          <img src={comment.author.profile_image} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          comment.author.nick_name.charAt(0).toUpperCase()
        )}
      </div>
      <div className={cn('max-w-[200px]', isOwn && 'text-right')}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.author.nick_name}</span>
          {comment.is_edited && <span className="text-xs text-slate-400">(수정됨)</span>}
        </div>
        <div
          className={cn(
            'mt-1 rounded-lg p-2 text-sm',
            isOwn ? 'bg-primary-100 text-primary-900' : 'bg-slate-100 text-slate-700'
          )}
        >
          {comment.comment_text}
        </div>
        <span className="mt-1 text-xs text-slate-400">
          {format(new Date(comment.created_at), 'p', { locale: ko })}
        </span>
      </div>
    </div>
  );
}
