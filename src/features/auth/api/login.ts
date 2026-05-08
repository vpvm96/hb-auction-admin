import { http } from '@/shared/api/http';
import type { AuthUser } from '../model/auth-store';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

/**
 * Placeholder — the Internal Admin API spec doesn't yet expose /auth/login.
 * Wire to the real endpoint once the backend defines it. Until then this
 * function will reject with a 404 and the login page surfaces the error.
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/internal/auth/login', payload);
  return data;
}
