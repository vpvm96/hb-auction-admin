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
import { dashboardApi, dashboardKeys } from '@/entities/dashboard/api/dashboard.api';
import { errorLogsApi, errorLogsKeys } from '@/entities/error-log/api/error-logs.api';
import { usersApi, usersKeys } from '@/entities/user/api/users.api';
import { UserStatusBadge } from '@/pages/users/user-status-badge';
import { PageHeader } from '@/widgets/page-header/page-header';

export function DashboardPage() {
  const queries = useQueries({
    queries: [
      {
        queryKey: dashboardKeys.counts(),
        queryFn: () => dashboardApi.counts(),
      },
      {
        queryKey: dashboardKeys.stats(7),
        queryFn: () => dashboardApi.stats(7),
      },
      {
        queryKey: usersKeys.list({ page: 1, size: 5 }),
        queryFn: () => usersApi.list({ page: 1, size: 5 }),
      },
      {
        queryKey: errorLogsKeys.list({ page: 1, size: 6 }),
        queryFn: () => errorLogsApi.list({ page: 1, size: 6 }),
      },
    ],
  });

  const [countsQ, statsQ, usersQ, errorsQ] = queries;
  const refetchAll = () => queries.forEach((q) => q.refetch());
  const isFetching = queries.some((q) => q.isFetching);

  const counts = countsQ.data;
  const stats = statsQ.data;
  const recentUsers = usersQ.data?.items ?? [];
  const recentErrors = errorsQ.data?.items ?? [];

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
          value={fmtNumber(counts?.users)}
          icon={Users}
          to={ROUTES.users}
          hint={
            stats?.users
              ? `Active ${fmtNumber(stats.users.active)} · Suspended ${fmtNumber(stats.users.suspended)} · Deleted ${fmtNumber(stats.users.deleted)}`
              : undefined
          }
        />
        <KpiStat
          label="등록된 퀴즈"
          value={fmtNumber(counts?.quizzes)}
          icon={HelpCircle}
          to={ROUTES.quizzes}
        />
        <KpiStat
          label="알림 템플릿"
          value={fmtNumber(counts?.notificationTemplates)}
          icon={Send}
          to={ROUTES.templates}
        />
        <KpiStat
          label="에러 로그"
          value={fmtNumber(counts?.errorLogs)}
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
            <div className="text-sm font-bold">에러 트렌드</div>
            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              GET /internal/dashboard/stats?trendDays=7
            </div>
          </div>
          <div className="px-4 py-3.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-[var(--hb-red-700)]">
                {fmtNumber(stats?.errorLogs.totalToday)}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                오늘 발생
              </span>
            </div>
            <DailyTrendBars trend={stats?.errorLogs.dailyTrend ?? []} />
          </div>
          <div className="border-t border-border/50">
            <div className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              Top 에러 코드
            </div>
            {(stats?.errorLogs.topErrorCodes ?? []).length === 0 ? (
              <div className="px-4 pb-3.5 text-[11px] italic text-muted-foreground/70">
                집계된 에러 코드가 없습니다.
              </div>
            ) : (
              (stats?.errorLogs.topErrorCodes ?? []).slice(0, 5).map((c) => (
                <div
                  key={c.errorCode}
                  className="flex items-center gap-3 border-t border-border/50 px-4 py-2"
                >
                  <span className="flex-1 truncate font-mono text-[12px] font-semibold text-[var(--hb-red-700)]">
                    {c.errorCode || '—'}
                  </span>
                  <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                    {fmtNumber(c.count)}
                  </span>
                </div>
              ))
            )}
          </div>
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
            <div className="text-sm font-bold">사용자 상태 분포</div>
            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              GET /internal/dashboard/stats
            </div>
          </div>
          <div className="p-4">
            {(
              [
                {
                  label: 'Active',
                  count: stats?.users.active ?? 0,
                  color: 'var(--hb-green-700)',
                },
                {
                  label: 'Suspended',
                  count: stats?.users.suspended ?? 0,
                  color: 'var(--hb-yellow-700)',
                },
                {
                  label: 'Deleted',
                  count: stats?.users.deleted ?? 0,
                  color: 'var(--hb-red-700)',
                },
              ] as const
            ).map((s) => {
              const total = stats?.users.total ?? 0;
              const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
              return (
                <div key={s.label} className="mb-3.5 last:mb-0">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold">{s.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      <b className="text-foreground">{fmtNumber(s.count)}</b>명 · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${pct}%`, background: s.color }}
                    />
                  </div>
                </div>
              );
            })}
            {!stats && !statsQ.isLoading ? (
              <div className="py-2 text-center text-xs text-muted-foreground">
                통계를 불러오지 못했습니다.
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

function DailyTrendBars({ trend }: { trend: { date: string; count: number }[] }) {
  if (trend.length === 0) {
    return (
      <div className="mt-3 h-12 rounded-md border border-dashed border-border text-[11px] italic leading-[3rem] text-center text-muted-foreground/70">
        트렌드 데이터 없음
      </div>
    );
  }
  const max = Math.max(1, ...trend.map((t) => t.count));
  return (
    <div className="mt-3 flex h-14 items-end gap-1">
      {trend.map((t) => {
        const pct = (t.count / max) * 100;
        return (
          <div
            key={t.date}
            className="group relative flex-1"
            title={`${t.date} · ${t.count}건`}
          >
            <div
              className="rounded-sm bg-[var(--hb-red-500)]/70 transition-colors group-hover:bg-[var(--hb-red-500)]"
              style={{ height: `${Math.max(4, pct)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

