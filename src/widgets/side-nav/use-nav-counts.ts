import { useQueries } from '@tanstack/react-query';
import { errorLogsApi, errorLogsKeys } from '@/entities/error-log/api/error-logs.api';
import {
  templatesApi,
  templatesKeys,
} from '@/entities/notification-template/api/templates.api';
import { quizzesApi, quizzesKeys } from '@/entities/quiz/api/quizzes.api';
import { usersApi, usersKeys } from '@/entities/user/api/users.api';
import type { NavCountKey } from './nav-config';

/**
 * Tiny size=1 queries — we only need totalElements for the badges.
 * Cache is independent from the page-level lists (which use size=20),
 * but each call is just a header fetch on the backend.
 */
export function useNavCounts(): Partial<Record<NavCountKey, number>> {
  const [users, quizzes, templates, errors] = useQueries({
    queries: [
      {
        queryKey: usersKeys.list({ page: 1, size: 1 }),
        queryFn: () => usersApi.list({ page: 1, size: 1 }),
      },
      {
        queryKey: quizzesKeys.list({ page: 1, size: 1 }),
        queryFn: () => quizzesApi.list({ page: 1, size: 1 }),
      },
      {
        queryKey: templatesKeys.list(),
        queryFn: () => templatesApi.list(),
      },
      {
        queryKey: errorLogsKeys.list({ page: 1, size: 1 }),
        queryFn: () => errorLogsApi.list({ page: 1, size: 1 }),
      },
    ],
  });

  return {
    users: users.data?.totalElements,
    quizzes: quizzes.data?.totalElements,
    templates: templates.data?.length,
    errors: errors.data?.totalElements,
  };
}
