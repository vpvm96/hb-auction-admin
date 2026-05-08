import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'super' | 'ops' | 'review' | 'cs' | 'fin';
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (payload: { accessToken: string; user: AuthUser }) => void;
  clear: () => void;
}

/**
 * Access token + user identity.
 * The Hammer Internal API spec doesn't yet document an auth scheme — this
 * store is the seam where login/refresh wires in once the backend exposes it.
 * Token is persisted to localStorage; swap to in-memory + httpOnly refresh
 * cookie when the backend supports it.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: ({ accessToken, user }) => set({ accessToken, user }),
      clear: () => set({ accessToken: null, user: null }),
    }),
    {
      name: 'hb-admin-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
