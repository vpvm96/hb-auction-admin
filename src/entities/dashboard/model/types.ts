/**
 * Dashboard 통계 스키마 (OpenAPI):
 *   - DashboardStats: 사용자/퀴즈/에러 통계 한 방 조회
 *   - OverviewCounts: 사용자, 퀴즈, 에러로그, 알림 템플릿 전체 건수
 */
export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  deleted: number;
}

export interface ErrorCountByCode {
  errorCode: string;
  count: number;
}

export interface DailyErrorCount {
  /** ISO date (YYYY-MM-DD) */
  date: string;
  count: number;
}

export interface ErrorLogStats {
  totalToday: number;
  topErrorCodes: ErrorCountByCode[];
  dailyTrend: DailyErrorCount[];
}

export interface DashboardStats {
  users: UserStats;
  totalQuizzes: number;
  errorLogs: ErrorLogStats;
}

export interface OverviewCounts {
  users: number;
  quizzes: number;
  errorLogs: number;
  notificationTemplates: number;
}
