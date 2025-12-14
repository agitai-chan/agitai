import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { googleLogin } from '@/api/endpoints/auth';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

interface GoogleLoginButtonProps {
  onNewUser?: (email: string) => void;
}

export function GoogleLoginButton({ onNewUser }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Google 인증 정보를 가져올 수 없습니다');
      return;
    }

    setIsLoading(true);
    try {
      // Google ID token을 백엔드로 전송
      const response = await googleLogin({ google_token: credentialResponse.credential });
      const result = response.data;

      // 신규 사용자인 경우
      if ('is_new_user' in result && result.is_new_user) {
        if (onNewUser) {
          onNewUser(result.google_email);
        } else {
          // 세션 스토리지에 이메일 저장 후 추가 정보 입력 페이지로 이동
          sessionStorage.setItem('google_signup_email', result.google_email);
          navigate('/signup/complete');
        }
        return;
      }

      // 기존 사용자 로그인 성공
      if ('access_token' in result) {
        storeLogin(
          {
            user_id: result.user.user_id,
            email: result.user.email,
            nick_name: result.user.nick_name,
            profile_image: result.user.profile_image,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          result.access_token,
          result.refresh_token
        );
        toast.success('로그인되었습니다');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Google 로그인 실패:', error);
      toast.error(error.response?.data?.message || 'Google 로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google 로그인에 실패했습니다');
  };

  if (isLoading) {
    return (
      <div className="flex h-10 w-full items-center justify-center rounded-md border border-gray-300 bg-white">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  return (
    <div className="w-full [&>div]:w-full [&>div>div]:w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="100%"
        locale="ko"
      />
    </div>
  );
}
