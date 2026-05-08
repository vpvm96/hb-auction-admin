export const ROUTES = {
  root: '/',
  login: '/login',
  dashboard: '/dashboard',
  users: '/users',
  userDetail: (id: string) => `/users/${id}`,
  quizzes: '/quizzes',
  quizDetail: (id: string | number) => `/quizzes/${id}`,
  templates: '/templates',
  templateDetail: (id: string | number) => `/templates/${id}`,
  errors: '/errors',
} as const;
