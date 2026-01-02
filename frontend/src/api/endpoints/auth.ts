import { apiClient, apiClientMultipart } from '../axios';
import { createFormData } from '@/utils/fileUpload';
import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  GoogleLoginRequest,
  GoogleNewUserResponse,
  GoogleSignupCompleteRequest,
  GoogleSignupCompleteResponse,
  UserProfile,
  UpdateProfileRequest,
  MessageResponse,
  ApiResponse,
} from '../types';

// ==========================================
// Auth API Endpoints
// ==========================================

/**
 * 이메일 회원가입
 * POST /user/signup
 */
export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const response = await apiClient.post<SignupResponse>('/user/signup', data);
  return response.data;
};

/**
 * 이메일 로그인
 * POST /user/login
 */
export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/user/login', data);
  return response.data;
};

/**
 * 구글 로그인
 * POST /user/google-login
 */
export const googleLogin = async (
  data: GoogleLoginRequest
): Promise<ApiResponse<LoginResponse> | ApiResponse<GoogleNewUserResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse> | ApiResponse<GoogleNewUserResponse>>(
    '/user/google-login',
    data
  );
  return response.data;
};

/**
 * 구글 회원가입 완료 (추가 정보 입력)
 * POST /user/google-signup-complete
 */
export const googleSignupComplete = async (
  data: GoogleSignupCompleteRequest
): Promise<GoogleSignupCompleteResponse> => {
  const response = await apiClient.post<GoogleSignupCompleteResponse>(
    '/user/google-signup-complete',
    data
  );
  return response.data;
};

/**
 * 비밀번호 재설정 요청
 * POST /user/password-reset
 */
export const requestPasswordReset = async (email: string): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/user/password-reset', { email });
  return response.data;
};

/**
 * 프로필 조회
 * GET /user/profile
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/user/profile');
  return response.data;
};

/**
 * 프로필 수정
 * PUT /user/profile
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  const formData = createFormData({
    nick_name: data.nick_name,
    bio: data.bio,
    profile_image: data.profile_image,
  });

  const response = await apiClientMultipart.put<UserProfile>('/user/profile', formData);
  return response.data;
};

/**
 * 로그아웃
 * POST /user/logout
 */
export const logout = async (): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/user/logout');
  return response.data;
};
