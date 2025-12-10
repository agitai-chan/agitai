import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.agit.io/v1';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 주입
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 핸들링 & 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 401 에러 + 재시도 안 한 경우 -> 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        
        if (refreshToken) {
          // 토큰 갱신 요청
          const response = await axios.post(`${API_BASE_URL}/user/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token } = response.data;
          
          // 스토어 업데이트
          useAuthStore.getState().setTokens(access_token, refresh_token);
          
          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 갱신 실패 -> 로그아웃
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // 에러 응답 파싱
    const errorResponse = error.response?.data as {
      error_code?: string;
      message?: string;
    };
    
    return Promise.reject({
      status: error.response?.status,
      code: errorResponse?.error_code || 'UNKNOWN_ERROR',
      message: errorResponse?.message || '알 수 없는 오류가 발생했습니다.',
      original: error,
    });
  }
);

// FormData 전송용 인스턴스
export const apiClientMultipart = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// multipart 인스턴스에도 동일한 인터셉터 적용
apiClientMultipart.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

apiClientMultipart.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorResponse = error.response?.data as {
      error_code?: string;
      message?: string;
    };
    
    return Promise.reject({
      status: error.response?.status,
      code: errorResponse?.error_code || 'UNKNOWN_ERROR',
      message: errorResponse?.message || '알 수 없는 오류가 발생했습니다.',
      original: error,
    });
  }
);

export default apiClient;

// 별칭 export (endpoints에서 사용)
export { apiClient as api };
