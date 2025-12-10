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

export interface LoginResponse {
  user_id: string;
  email: string;
  nick_name: string;
  profile_image?: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface GoogleLoginRequest {
  id_token: string;
}

export interface GoogleNewUserResponse {
  temp_token: string;
  email: string;
  google_id: string;
  profile_image?: string;
  requires_additional_info: boolean;
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
