import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/features/auth/model/auth-store';

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token from auth store on every request.
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// On 401, clear auth — ProtectedRoute redirects to /login on next render.
http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clear();
    }
    return Promise.reject(error);
  },
);
