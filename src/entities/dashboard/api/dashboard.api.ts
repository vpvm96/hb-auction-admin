import { http } from '@/shared/api/http';
import type { DashboardStats, OverviewCounts } from '../model/types';

export const dashboardApi = {
  /** 유저/퀴즈/에러 로그 통계를 한 번에 조회. */
  stats: async (trendDays = 7): Promise<DashboardStats> => {
    const { data } = await http.get<DashboardStats>('/internal/dashboard/stats', {
      params: { trendDays },
    });
    return data;
  },
  /** 사용자, 퀴즈, 에러 로그, 알림 템플릿 전체 건수. */
  counts: async (): Promise<OverviewCounts> => {
    const { data } = await http.get<OverviewCounts>('/internal/dashboard/counts');
    return data;
  },
};

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (trendDays: number) => [...dashboardKeys.all, 'stats', trendDays] as const,
  counts: () => [...dashboardKeys.all, 'counts'] as const,
};
