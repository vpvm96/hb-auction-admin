/**
 * Hammer Internal Admin API path layout:
 *   {VITE_API_BASE_URL} + {API_PREFIX} + {endpoint}
 *
 * Example:
 *   https://hobom-system.com + /hammer-internal + /internal/notification-templates
 *
 * `hammer-internal` is the service context path; endpoints under it all
 * start with `/internal/...`. The prefix is fixed across environments,
 * only BASE_URL swaps when targeting local backend (http://localhost:8090
 * has no `/hammer-internal` prefix — set BASE_URL accordingly there).
 */
export const API_PREFIX = '/hammer-internal';

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  apiPrefix: API_PREFIX,
  apiUrl: `${import.meta.env.VITE_API_BASE_URL}${API_PREFIX}`,
  env: import.meta.env.VITE_ENV,
} as const;
