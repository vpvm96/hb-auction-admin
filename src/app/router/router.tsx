import { Navigate, createBrowserRouter } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { ProtectedRoute } from '@/features/auth/ui/protected-route';
import { AppShell } from '@/widgets/app-shell/app-shell';
import { LoginPage } from '@/pages/login/login-page';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { UsersPage } from '@/pages/users/users-page';
import { QuizzesPage } from '@/pages/quizzes/quizzes-page';
import { TemplatesPage } from '@/pages/templates/templates-page';
import { ErrorsPage } from '@/pages/errors/errors-page';
import { NotFoundPage } from '@/pages/not-found/not-found-page';

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          { path: ROUTES.users, element: <UsersPage /> },
          { path: ROUTES.quizzes, element: <QuizzesPage /> },
          { path: ROUTES.templates, element: <TemplatesPage /> },
          { path: ROUTES.errors, element: <ErrorsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
