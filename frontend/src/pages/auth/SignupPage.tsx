import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores';
import { signup } from '@/api/endpoints/auth';
import { VALIDATION } from '@/utils/constants';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z
    .string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `비밀번호는 ${VALIDATION.PASSWORD_MIN_LENGTH}자 이상이어야 합니다`)
    .regex(/[A-Za-z]/, '영문자를 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다'),
  nick_name: z
    .string()
    .min(VALIDATION.NICKNAME_MIN_LENGTH, `닉네임은 ${VALIDATION.NICKNAME_MIN_LENGTH}자 이상이어야 합니다`)
    .max(VALIDATION.NICKNAME_MAX_LENGTH, `닉네임은 ${VALIDATION.NICKNAME_MAX_LENGTH}자 이하여야 합니다`),
  agreed_terms: z.literal(true, { errorMap: () => ({ message: '이용약관에 동의해주세요' }) }),
  agreed_privacy: z.literal(true, { errorMap: () => ({ message: '개인정보처리방침에 동의해주세요' }) }),
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      agreed_terms: false as any,
      agreed_privacy: false as any,
    },
  });

  const password = watch('password', '');

  const passwordChecks = {
    length: password.length >= VALIDATION.PASSWORD_MIN_LENGTH,
    letter: /[A-Za-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const response = await signup(data);
      setAuth(
        {
          user_id: response.user_id,
          email: response.email,
          nick_name: response.nick_name,
          created_at: '',
          updated_at: '',
        },
        response.access_token,
        response.refresh_token
      );
      toast.success('회원가입이 완료되었습니다.');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      if (error.status === 409) {
        toast.error('이미 가입된 이메일입니다.');
      } else {
        toast.error('회원가입에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-slate-900">회원가입</h1>
        <p className="mt-2 text-slate-600">AGIT과 함께 시작하세요</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input type="email" placeholder="이메일" className="pl-10" {...register('email')} error={errors.email?.message} />
        </div>

        <div className="relative">
          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input type="text" placeholder="닉네임" className="pl-10" {...register('nick_name')} error={errors.nick_name?.message} />
        </div>

        <div>
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
          <div className="mt-2 flex gap-4 text-xs">
            <span className={passwordChecks.length ? 'text-green-600' : 'text-slate-400'}>
              <Check className="mr-1 inline h-3 w-3" />8자 이상
            </span>
            <span className={passwordChecks.letter ? 'text-green-600' : 'text-slate-400'}>
              <Check className="mr-1 inline h-3 w-3" />영문 포함
            </span>
            <span className={passwordChecks.number ? 'text-green-600' : 'text-slate-400'}>
              <Check className="mr-1 inline h-3 w-3" />숫자 포함
            </span>
          </div>
        </div>

        <div className="space-y-3 rounded-lg bg-slate-50 p-4">
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 rounded border-slate-300" {...register('agreed_terms')} />
            <span className="text-sm text-slate-600">
              <Link to="/terms" className="text-primary-600 hover:underline">이용약관</Link>에 동의합니다 (필수)
            </span>
          </label>
          {errors.agreed_terms && <p className="text-sm text-red-600">{errors.agreed_terms.message}</p>}

          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 rounded border-slate-300" {...register('agreed_privacy')} />
            <span className="text-sm text-slate-600">
              <Link to="/privacy" className="text-primary-600 hover:underline">개인정보처리방침</Link>에 동의합니다 (필수)
            </span>
          </label>
          {errors.agreed_privacy && <p className="text-sm text-red-600">{errors.agreed_privacy.message}</p>}
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          가입하기
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          로그인
        </Link>
      </p>
    </div>
  );
}
