import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { useAuthStore } from '@/stores';
import { login } from '@/api/endpoints/auth';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuth } = useAuthStore();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await login(data);
      const result = response.data;
      setAuth(
        {
          user_id: result.user.user_id,
          email: result.user.email,
          nick_name: result.user.nick_name,
          profile_image: result.user.profile_image,
          created_at: result.user.created_at,
          updated_at: result.user.updated_at,
        },
        result.access_token,
        result.refresh_token
      );
      toast.success('로그인되었습니다.');
      navigate(from, { replace: true });
    } catch (error: any) {
      if (error.status === 401) {
        toast.error('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (error.status === 429) {
        toast.error('로그인 시도 횟수를 초과했습니다. 5분 후 다시 시도해주세요.');
      } else {
        toast.error('로그인에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-slate-900">로그인</h1>
        <p className="mt-2 text-slate-600">AGIT에 오신 것을 환영합니다</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="email"
            placeholder="이메일"
            className="pl-10"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호"
            className="pl-10 pr-10"
            {...register('password')}
            error={errors.password?.message}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-slate-300" />
            <span className="text-sm text-slate-600">로그인 유지</span>
          </label>
          <Link to="/password-reset" className="text-sm text-primary-600 hover:text-primary-700">
            비밀번호 찾기
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          로그인
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm text-slate-500">또는</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleLoginButton />

      <p className="mt-8 text-center text-sm text-slate-600">
        아직 계정이 없으신가요?{' '}
        <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
          회원가입
        </Link>
      </p>

      {/* 개발용 테스트 로그인 */}
      {import.meta.env.DEV && (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <p className="mb-3 text-center text-xs text-slate-500">개발용 테스트</p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setAuth(
                {
                  user_id: 'test-user-1',
                  email: 'test@example.com',
                  nick_name: '테스트 사용자',
                  profile_image: undefined,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                'mock-access-token',
                'mock-refresh-token'
              );
              toast.success('테스트 로그인 성공!');
              navigate('/dashboard', { replace: true });
            }}
          >
            테스트 계정으로 로그인
          </Button>
        </div>
      )}
    </div>
  );
}