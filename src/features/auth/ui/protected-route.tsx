import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../model/auth-store';
import { ROUTES } from '@/shared/config/routes';

export function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
