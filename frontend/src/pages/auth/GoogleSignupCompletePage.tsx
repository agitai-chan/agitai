import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, User, Check } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { googleSignupComplete } from '@/api/endpoints/auth';
import { VALIDATION } from '@/utils/constants';
import toast from 'react-hot-toast';

const googleSignupSchema = z.object({
  nick_name: z
    .string()
    .min(VALIDATION.NICKNAME_MIN_LENGTH, `닉네임은 ${VALIDATION.NICKNAME_MIN_LENGTH}자 이상이어야 합니다`)
    .max(VALIDATION.NICKNAME_MAX_LENGTH, `닉네임은 ${VALIDATION.NICKNAME_MAX_LENGTH}자 이하여야 합니다`),
  agreed_terms: z.literal(true, { errorMap: () => ({ message: '이용약관에 동의해주세요' }) }),
  agreed_privacy: z.literal(true, { errorMap: () => ({ message: '개인정보처리방침에 동의해주세요' }) }),
});

type GoogleSignupFormData = z.infer<typeof googleSignupSchema>;

export function GoogleSignupCompletePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoogleSignupFormData>({
    resolver: zodResolver(googleSignupSchema),
    defaultValues: {
      agreed_terms: false as any,
      agreed_privacy: false as any,
    },
  });

  useEffect(() => {
    const email = sessionStorage.getItem('google_signup_email');
    if (!email) {
      toast.error('Google 인증 정보가 없습니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }
    setGoogleEmail(email);
  }, [navigate]);

  const onSubmit = async (data: GoogleSignupFormData) => {
    if (!googleEmail) {
      toast.error('Google 인증 정보가 없습니다.');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      await googleSignupComplete({
        email: googleEmail,
        real_name: data.nick_name, // 닉네임을 실명으로도 사용
        nick_name: data.nick_name,
        terms_all_agree: data.agreed_terms && data.agreed_privacy,
      });

      // 세션 스토리지 정리
      sessionStorage.removeItem('google_signup_email');

      toast.success('회원가입이 완료되었습니다. 다시 로그인해주세요.');
      navigate('/login', { replace: true });
    } catch (error: any) {
      if (error.response?.status === 409) {
        const code = error.response?.data?.code;
        if (code === 'USER_002') {
          toast.error('이미 사용 중인 닉네임입니다.');
        } else {
          toast.error('이미 가입된 이메일입니다.');
        }
      } else {
        toast.error(error.response?.data?.message || '회원가입에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!googleEmail) {
    return null;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-slate-900">추가 정보 입력</h1>
        <p className="mt-2 text-slate-600">Google 계정으로 회원가입을 완료해주세요</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* 이메일 (읽기 전용) */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="email"
            value={googleEmail}
            disabled
            className="pl-10 bg-slate-50 text-slate-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Check className="h-5 w-5 text-green-500" />
          </div>
        </div>

        {/* 닉네임 */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="닉네임"
            className="pl-10"
            {...register('nick_name')}
            error={errors.nick_name?.message}
          />
        </div>

        {/* 약관 동의 */}
        <div className="space-y-3 rounded-lg bg-slate-50 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300"
              {...register('agreed_terms')}
            />
            <span className="text-sm text-slate-600">
              <Link to="/terms" className="text-primary-600 hover:underline">
                이용약관
              </Link>
              에 동의합니다 (필수)
            </span>
          </label>
          {errors.agreed_terms && (
            <p className="text-sm text-red-600">{errors.agreed_terms.message}</p>
          )}

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300"
              {...register('agreed_privacy')}
            />
            <span className="text-sm text-slate-600">
              <Link to="/privacy" className="text-primary-600 hover:underline">
                개인정보처리방침
              </Link>
              에 동의합니다 (필수)
            </span>
          </label>
          {errors.agreed_privacy && (
            <p className="text-sm text-red-600">{errors.agreed_privacy.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          가입 완료
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        다른 계정으로 가입하시겠어요?{' '}
        <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
          이메일로 가입
        </Link>
      </p>
    </div>
  );
}
