import { http } from '@/shared/api/http';
import type { Page, PageQuery } from '@/shared/types/api';
import type { ErrorLog } from '../model/types';

export interface ErrorLogsQuery extends PageQuery {
  /** HTTP status code filter (single value, e.g. 400, 500). */
  status?: number;
  /** 비즈니스 에러 코드 필터 (예: NOT_FOUND, BAD_REQUEST). */
  errorCode?: string;
  /** 시작 일시 (ISO 8601). */
  from?: string;
  /** 종료 일시 (ISO 8601). */
  to?: string;
  /** URI 패턴 검색. */
  uri?: string;
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
