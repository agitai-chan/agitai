import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';

const resetSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
});

type ResetFormData = z.infer<typeof resetSchema>;

export function PasswordResetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    try {
      // TODO: API 연동
      console.log('Password reset request:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      toast.success('비밀번호 재설정 이메일이 발송되었습니다.');
    } catch (error) {
      toast.error('이메일 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="animate-fade-in text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">이메일을 확인해주세요</h2>
        <p className="mb-6 text-slate-600">
          비밀번호 재설정 링크가 포함된 이메일을 발송했습니다.
          <br />
          메일함을 확인해주세요.
        </p>
        <Link to="/login">
          <Button variant="outline" className="w-full">
            로그인으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link
        to="/login"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        로그인으로 돌아가기
      </Link>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">비밀번호 찾기</h2>
        <p className="mt-2 text-slate-600">
          가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="email"
            placeholder="이메일"
            className="pl-10"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          재설정 링크 받기
        </Button>
      </form>
    </div>
  );
}
