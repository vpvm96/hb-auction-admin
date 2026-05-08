import { useQuery } from '@tanstack/react-query';
import { dashboardApi, dashboardKeys } from '@/entities/dashboard/api/dashboard.api';
import type { NavCountKey } from './nav-config';

/**
 * 사이드바 네비게이션 배지에 표시할 전체 카운트.
 * 4개 엔티티의 size=1 쿼리를 따로 날리는 대신 dashboardApi.counts() 한 번으로 모두 조회.
 */
export function useNavCounts(): Partial<Record<NavCountKey, number>> {
  const { data } = useQuery({
    queryKey: dashboardKeys.counts(),
    queryFn: () => dashboardApi.counts(),
  });

  return {
    users: data?.users,
    quizzes: data?.quizzes,
    templates: data?.notificationTemplates,
    errors: data?.errorLogs,
  };
}
