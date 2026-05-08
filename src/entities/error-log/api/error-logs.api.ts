import { http } from '@/shared/api/http';
import type { Page, PageQuery } from '@/shared/types/api';
import type { ErrorLog } from '../model/types';

export interface ErrorLogsQuery extends PageQuery {
  /** HTTP status code filter (single value, e.g. 400, 500). */
  status?: number;
}

export const errorLogsApi = {
  list: async (query: ErrorLogsQuery = {}): Promise<Page<ErrorLog>> => {
    const { data } = await http.get<Page<ErrorLog>>('/internal/error-logs', { params: query });
    return data;
  },
};

export const errorLogsKeys = {
  all: ['error-logs'] as const,
  list: (query: ErrorLogsQuery) => [...errorLogsKeys.all, 'list', query] as const,
};
