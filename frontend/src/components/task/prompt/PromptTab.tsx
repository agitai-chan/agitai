import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, Bot, User, Settings2 } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { getPromptHistory, submitPrompt } from '@/api/endpoints/task';
import { queryKeys } from '@/lib/queryClient';
import { useAuthStore } from '@/stores';
import { AI_MODELS, DEFAULT_AI_MODEL } from '@/utils/constants';
import type { PromptConversation, AIModel } from '@/api/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface PromptTabProps {
  taskId: string;
  teamMembers?: Array<{ user_id: string; nick_name: string }>;
}

export function PromptTab({ taskId, teamMembers }: PromptTabProps) {
  const { user } = useAuthStore();
  const [selectedUserId, setSelectedUserId] = useState(user?.user_id || '');
  const [promptText, setPromptText] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_AI_MODEL);
  const [showSettings, setShowSettings] = useState(false);

  const isOwnTab = selectedUserId === user?.user_id;

  // 프롬프트 히스토리 조회
  const { data: historyData, isLoading, refetch } = useQuery({
    queryKey: queryKeys.prompt.history(taskId, selectedUserId),
    queryFn: () => getPromptHistory(taskId, selectedUserId),
    enabled: !!selectedUserId,
  });

  // 프롬프트 제출
  const submitMutation = useMutation({
    mutationFn: () =>
      submitPrompt(taskId, user!.user_id, {
        prompt_text: promptText,
        ai_model: selectedModel,
      }),
    onSuccess: () => {
      setPromptText('');
      refetch();
      toast.success('프롬프트가 실행되었습니다.');
    },
    onError: () => {
      toast.error('프롬프트 실행에 실패했습니다.');
    },
  });

  const handleSubmit = () => {
    if (!promptText.trim()) return;
    if (!isOwnTab) {
      toast.error('본인의 탭에서만 프롬프트를 입력할 수 있습니다.');
      return;
    }
    submitMutation.mutate();
  };

  const conversations = historyData?.history || [];

  return (
    <div className="mt-4 flex h-[calc(100vh-400px)] flex-col">
      {/* Team Member Tabs (if team task) */}
      {teamMembers && teamMembers.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {teamMembers.map((member) => (
            <button
              key={member.user_id}
              onClick={() => setSelectedUserId(member.user_id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedUserId === member.user_id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {member.nick_name}
              {member.user_id === user?.user_id && (
                <Badge variant="primary" size="sm">
                  나
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Chat Container */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary-100 p-4">
                <Bot className="h-8 w-8 text-primary-600" />
              </div>
              <p className="mt-4 text-lg font-medium text-slate-900">
                AI와 대화를 시작하세요
              </p>
              <p className="mt-2 text-slate-500">
                프롬프트를 입력하면 AI가 답변을 생성합니다.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {conversations.map((conv) => (
                <ConversationItem key={conv.prompt_id} conversation={conv} />
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4">
          {/* Settings Toggle */}
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <Settings2 className="h-4 w-4" />
              AI 설정
            </button>
            
            {showSettings && (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as AIModel)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              >
                {AI_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={
                isOwnTab
                  ? '프롬프트를 입력하세요...'
                  : '다른 팀원의 대화는 읽기만 가능합니다.'
              }
              disabled={!isOwnTab || submitMutation.isPending}
              className="flex-1 resize-none rounded-lg border border-slate-300 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-500"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={!promptText.trim() || !isOwnTab || submitMutation.isPending}
              isLoading={submitMutation.isPending}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {!isOwnTab && (
            <p className="mt-2 text-sm text-amber-600">
              다른 팀원의 탭에서는 대화 내용을 읽기만 할 수 있습니다.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// Conversation Item
// ==========================================

function ConversationItem({ conversation }: { conversation: PromptConversation }) {
  return (
    <div className="space-y-4">
      {/* User Message */}
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200">
          <User className="h-4 w-4 text-slate-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">You</span>
            <span className="text-xs text-slate-400">
              {format(new Date(conversation.created_at), 'PPp', { locale: ko })}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-slate-700">
            {conversation.prompt_text}
          </p>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
          <Bot className="h-4 w-4 text-primary-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary-600">AI</span>
            <Badge variant="default" size="sm">
              {conversation.ai_model}
            </Badge>
            <span className="text-xs text-slate-400">
              {conversation.tokens_used} tokens
            </span>
          </div>
          <div className="mt-1 whitespace-pre-wrap text-slate-700">
            {conversation.ai_response}
          </div>
        </div>
      </div>
    </div>
  );
}
