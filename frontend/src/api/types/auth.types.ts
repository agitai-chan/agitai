// ==========================================
// Auth Types
// ==========================================

export interface SignupRequest {
  email: string;
  password: string;
  nick_name: string;
  agreed_terms: boolean;
  agreed_privacy: boolean;
}

export interface SignupResponse {
  user_id: string;
  email: string;
  nick_name: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfileResponse {
  user_id: string;
  email: string;
  real_name: string;
  nick_name: string;
  profile_image?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfileResponse;
}

export interface GoogleLoginRequest {
  google_token: string;
}

export interface GoogleNewUserResponse {
  is_new_user: boolean;
  google_email: string;
  nickname: string;
  redirect_url: string;
}

export interface GoogleSignupCompleteRequest {
  email: string;
  real_name: string;
  nick_name: string;
  terms_all_agree: boolean;
}

export interface GoogleSignupCompleteResponse {
  user_id: string;
  email: string;
  message: string;
  redirect_url: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  nick_name: string;
  profile_image?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  nick_name?: string;
  bio?: string;
  profile_image?: File;
}

// ==========================================
// Auth State
// ==========================================

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
