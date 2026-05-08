import { Link } from 'react-router';
import { Button } from '@/shared/ui/button';
import { ROUTES } from '@/shared/config/routes';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="text-6xl font-bold tracking-tight text-foreground">404</div>
      <p className="text-sm text-muted-foreground">요청하신 페이지를 찾을 수 없습니다.</p>
      <Button asChild>
        <Link to={ROUTES.dashboard}>대시보드로</Link>
      </Button>
    </div>
  );
}
