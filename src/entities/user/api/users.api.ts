import { http } from '@/shared/api/http';
import type { Page, PageQuery } from '@/shared/types/api';
import { USER_STATUS_CODE, type User, type UserStatus } from '../model/types';

export interface UsersListQuery extends PageQuery {
  status?: UserStatus | null;
}

export const usersApi = {
  list: async ({ status, ...rest }: UsersListQuery = {}): Promise<Page<User>> => {
    const params: Record<string, unknown> = { ...rest };
    if (status) params.status = USER_STATUS_CODE[status];
    const { data } = await http.get<Page<User>>('/internal/users', { params });
    return data;
  },
  get: async (id: string): Promise<User> => {
    const { data } = await http.get<User>(`/internal/users/${id}`);
    return data;
  },
};

export const usersKeys = {
  all: ['users'] as const,
  list: (query: UsersListQuery) => [...usersKeys.all, 'list', query] as const,
  detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
};
