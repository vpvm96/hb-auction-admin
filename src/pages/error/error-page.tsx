import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Link, isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';
import { Button } from '@/shared/ui/button';
import { ROUTES } from '@/shared/config/routes';

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  // 분기: react-router에서 throw한 ErrorResponse(404, 401 등) vs 런타임 Error
  const isRouter = isRouteErrorResponse(error);
  const headline = isRouter ? `${error.status} ${error.statusText}` : '문제가 발생했습니다';
  const message = isRouter
    ? error.data || '요청한 리소스를 처리할 수 없습니다.'
    : error instanceof Error
      ? error.message
      : '알 수 없는 오류가 발생했습니다.';
  const stack = error instanceof Error ? error.stack : undefined;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-4">
      <div className="flex w-full max-w-lg flex-col items-center gap-5 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-[var(--hb-red-100)] text-[var(--hb-red-700)]">
          <AlertTriangle className="size-7" />
        </span>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight">{headline}</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(0)}>
            <RefreshCw className="size-3.5" />
            <span>다시 시도</span>
          </Button>
          <Button size="sm" asChild>
            <Link to={ROUTES.dashboard}>
              <Home className="size-3.5" />
              <span>대시보드로</span>
            </Link>
          </Button>
        </div>

        {stack ? (
          <div className="mt-2 w-full">
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
            >
              {showDetails ? '상세 정보 숨기기 ▲' : '상세 정보 보기 ▼'}
            </button>
            {showDetails ? (
              <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-[var(--hb-fg-1)] p-3 text-left font-mono text-[11px] leading-relaxed text-[var(--hb-cyan-100)]">
                {stack}
              </pre>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
