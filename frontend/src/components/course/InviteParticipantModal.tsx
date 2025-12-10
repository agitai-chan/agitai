import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { getCourseInviteLink } from '@/api/endpoints/course';
import { queryKeys } from '@/lib/queryClient';
import toast from 'react-hot-toast';

interface InviteParticipantModalProps {
  workspaceId: string;
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteParticipantModal({
  workspaceId,
  courseId,
  isOpen,
  onClose,
}: InviteParticipantModalProps) {
  const [copied, setCopied] = useState(false);

  const { data: inviteData } = useQuery({
    queryKey: queryKeys.course.invite(courseId),
    queryFn: () => getCourseInviteLink(workspaceId, courseId),
    enabled: isOpen,
  });

  const handleCopy = () => {
    if (inviteData?.invite_link) {
      navigator.clipboard.writeText(inviteData.invite_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('초대 링크가 복사되었습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">참가자 초대</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-primary-50 p-4">
            <LinkIcon className="h-5 w-5 text-primary-600" />
            <div>
              <p className="font-medium text-primary-900">초대 링크로 초대하기</p>
              <p className="text-sm text-primary-700">
                아래 링크를 공유하면 누구나 이 코스에 참가자로 등록됩니다.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 truncate rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
              {inviteData?.invite_link || '링크를 불러오는 중...'}
            </div>
            <Button variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <Button variant="ghost" onClick={onClose}>
            닫기
          </Button>
        </div>
      </Card>
    </div>
  );
}
