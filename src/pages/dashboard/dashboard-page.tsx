import { useQueries } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Send,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { MethodBadge } from '@/shared/ui/method-badge';
import { StatusCodeBadge } from '@/shared/ui/status-code-badge';
import { ROUTES } from '@/shared/config/routes';
import { fmtDate, fmtDateTime, fmtNumber, fmtRelative } from '@/shared/lib/format';
import { errorLogsApi, errorLogsKeys } from '@/entities/error-log/api/error-logs.api';
import {
  templatesApi,
  templatesKeys,
} from '@/entities/notification-template/api/templates.api';
import { quizzesApi, quizzesKeys } from '@/entities/quiz/api/quizzes.api';
import { usersApi, usersKeys } from '@/entities/user/api/users.api';
import type { TemplateChannel } from '@/entities/notification-template/model/types';
import { UserStatusBadge } from '@/pages/users/user-status-badge';
import { PageHeader } from '@/widgets/page-header/page-header';

export function DashboardPage() {
  const queries = useQueries({
    queries: [
      {
        queryKey: usersKeys.list({ page: 1, size: 5 }),
        queryFn: () => usersApi.list({ page: 1, size: 5 }),
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
        queryKey: errorLogsKeys.list({ page: 1, size: 6 }),
        queryFn: () => errorLogsApi.list({ page: 1, size: 6 }),
      },
    ],
  });

  const [usersQ, quizzesQ, templatesQ, errorsQ] = queries;
  const refetchAll = () => queries.forEach((q) => q.refetch());
  const isFetching = queries.some((q) => q.isFetching);

  const recentUsers = usersQ.data?.items ?? [];
  const recentErrors = errorsQ.data?.items ?? [];
  const templates = templatesQ.data ?? [];

  return (
    <div className="pb-8">
      <PageHeader
        title="대시보드"
        description={`HB Auction 관리자 · ${fmtDate(new Date())} 기준`}
        breadcrumb={['관리자', '대시보드']}
        actions={
          <Button variant="secondary" size="sm" onClick={refetchAll}>
            <RefreshCw className={isFetching ? 'size-3.5 animate-spin' : 'size-3.5'} />
            <span>새로고침</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 px-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStat
          label="전체 사용자"
          value={fmtNumber(usersQ.data?.totalElements)}
          icon={Users}
          to={ROUTES.users}
        />
        <KpiStat
          label="등록된 퀴즈"
          value={fmtNumber(quizzesQ.data?.totalElements)}
          icon={HelpCircle}
          to={ROUTES.quizzes}
        />
        <KpiStat
          label="알림 템플릿"
          value={fmtNumber(templates.length)}
          icon={Send}
          to={ROUTES.templates}
          hint={
            templates.length > 0
              ? `Push ${templates.filter((t) => t.channel === 'Push').length} · InApp ${templates.filter((t) => t.channel === 'InApp').length} · Both ${templates.filter((t) => t.channel === 'Both').length}`
              : undefined
          }
        />
        <KpiStat
          label="에러 로그"
          value={fmtNumber(errorsQ.data?.totalElements)}
          icon={AlertTriangle}
          to={ROUTES.errors}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 px-6 lg:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center border-b border-border px-4 py-3.5">
            <div className="flex-1">
              <div className="text-sm font-bold">최근 에러 로그</div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                GET /internal/error-logs
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.errors}>
                <span>전체 보기</span>
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            {recentErrors.length === 0 && !errorsQ.isLoading ? (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                최근 에러 로그가 없습니다.
              </div>
            ) : (
              recentErrors.map((e) => (
                <div
                  key={e.id}
                  className="grid min-w-[760px] grid-cols-[140px_60px_70px_minmax(280px,1fr)_100px] items-center gap-3 border-b border-border/50 px-4 py-2.5 text-xs last:border-0"
                >
                  <span className="whitespace-nowrap font-mono text-muted-foreground">
                    {fmtDateTime(e.createdAt)}
                  </span>
                  <MethodBadge method={e.method} />
                  <StatusCodeBadge code={e.status} />
                  <span className="whitespace-nowrap font-mono">{e.uri}</span>
                  <span className="whitespace-nowrap text-right font-mono text-[11px] font-semibold text-[var(--hb-red-700)]">
                    {e.errorCode || '—'}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-border px-4 py-3.5">
            <div className="text-sm font-bold">API 엔드포인트</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">OpenAPI 3.1 · v0.0.1</div>
          </div>
          {[
            { tag: 'Users', icon: Users, count: 2, color: 'var(--hb-indigo-500)' },
            { tag: 'Quizzes', icon: HelpCircle, count: 5, color: 'var(--hb-cyan-500)' },
            {
              tag: 'Notification Templates',
              icon: Send,
              count: 6,
              color: 'var(--hb-green-500)',
            },
            {
              tag: 'Error Logs',
              icon: AlertTriangle,
              count: 1,
              color: 'var(--hb-red-500)',
            },
          ].map((g) => {
            const Icon = g.icon;
            return (
              <div
                key={g.tag}
                className="flex items-center gap-3 border-t border-border/50 px-4 py-2.5"
              >
                <span
                  className="inline-flex size-7 items-center justify-center rounded-md"
                  style={{
                    background: `color-mix(in srgb, ${g.color} 15%, transparent)`,
                    color: g.color,
                  }}
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="flex-1 text-[13px] font-semibold">{g.tag}</span>
                <span className="font-mono text-xs font-semibold text-muted-foreground">
                  {g.count} endpoint{g.count > 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </Card>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 px-6 lg:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center border-b border-border px-4 py-3.5">
            <div className="flex-1">
              <div className="text-sm font-bold">최근 가입 사용자</div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                GET /internal/users
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.users}>
                <span>전체</span>
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
          {recentUsers.length === 0 && !usersQ.isLoading ? (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              최근 가입자가 없습니다.
            </div>
          ) : (
            recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 border-b border-border/50 px-4 py-2.5 last:border-0"
              >
                <Avatar className="size-8">
                  <AvatarFallback>{u.nickname?.[0] ?? '?'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{u.nickname}</div>
                  <div className="truncate font-mono text-[11px] text-muted-foreground">
                    {u.email}
                  </div>
                </div>
                <UserStatusBadge status={u.status} />
                <span className="w-16 text-right text-[11px] tabular-nums text-muted-foreground">
                  {fmtRelative(u.createdAt)}
                </span>
              </div>
            ))
          )}
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-border px-4 py-3.5">
            <div className="text-sm font-bold">알림 템플릿 채널 분포</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">현재 활성 템플릿 기준</div>
          </div>
          <div className="p-4">
            {(['Push', 'InApp', 'Both'] as TemplateChannel[]).map((ch) => {
              const count = templates.filter((t) => t.channel === ch).length;
              const pct = templates.length > 0 ? Math.round((count / templates.length) * 100) : 0;
              const color =
                ch === 'Push'
                  ? 'var(--hb-indigo-500)'
                  : ch === 'InApp'
                    ? 'var(--hb-cyan-700)'
                    : 'var(--hb-green-700)';
              return (
                <div key={ch} className="mb-3.5 last:mb-0">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold">{ch}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      <b className="text-foreground">{count}</b>건 · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
            {templates.length === 0 && !templatesQ.isLoading ? (
              <div className="py-2 text-center text-xs text-muted-foreground">
                템플릿이 없습니다.
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

interface KpiStatProps {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
}

function KpiStat({ label, value, hint, icon: Icon, to }: KpiStatProps) {
  return (
    <Link
      to={to}
      className="block rounded-md border border-border bg-card p-4 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <span className="inline-flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-3.5" />
        </span>
      </div>
      <div className="mt-2 text-[28px] font-bold tracking-tight tabular-nums">{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div> : null}
    </Link>
  );
}

