import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { MethodBadge } from '@/shared/ui/method-badge';
import { StatusCodeBadge } from '@/shared/ui/status-code-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { fmtDateTime, fmtNumber } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import { errorLogsApi, errorLogsKeys } from '@/entities/error-log/api/error-logs.api';
import type { ErrorLog } from '@/entities/error-log/model/types';
import { PageHeader } from '@/widgets/page-header/page-header';

const STATUS_FILTERS: { value: number | null; label: string; cls: string }[] = [
  { value: null, label: '전체', cls: 'text-foreground' },
  { value: 400, label: '400', cls: 'text-[var(--hb-yellow-700)]' },
  { value: 403, label: '403', cls: 'text-[var(--hb-yellow-700)]' },
  { value: 404, label: '404', cls: 'text-[var(--hb-yellow-700)]' },
  { value: 500, label: '500', cls: 'text-[var(--hb-red-700)]' },
];

const METHOD_FILTERS = ['GET', 'POST', 'PUT', 'DELETE'] as const;

type RangePreset = 'all' | '24h' | '7d' | '30d';

const RANGE_FILTERS: { value: RangePreset; label: string }[] = [
  { value: 'all', label: '전체 기간' },
  { value: '24h', label: '24시간' },
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
];

function rangeToFromIso(preset: RangePreset): string | undefined {
  if (preset === 'all') return undefined;
  const now = Date.now();
  const ms = preset === '24h' ? 86_400_000 : preset === '7d' ? 7 * 86_400_000 : 30 * 86_400_000;
  return new Date(now - ms).toISOString();
}

export function ErrorsPage() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [range, setRange] = useState<RangePreset>('all');
  const [uri, setUri] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [expanded, setExpanded] = useState<number | string | null>(null);

  const params = {
    page,
    size,
    status: statusFilter ?? undefined,
    uri: uri.trim() || undefined,
    errorCode: errorCode.trim() || undefined,
    from: rangeToFromIso(range),
  };

  const query = useQuery({
    queryKey: errorLogsKeys.list(params),
    queryFn: () => errorLogsApi.list(params),
    placeholderData: (prev) => prev,
  });

  const allItems = query.data?.items ?? [];
  // Method filter is applied client-side (backend doesn't expose it).
  const items = methodFilter ? allItems.filter((e) => e.method === methodFilter) : allItems;
  const totalElements = query.data?.totalElements ?? 0;
  const totalPages = query.data?.totalPages ?? 1;

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-page${page}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="에러 로그"
        description="HTTP 4xx / 5xx 응답을 자동 수집"
        breadcrumb={['관리자', '운영', '에러 로그']}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={exportJSON}>
              <Download className="size-3.5" />
              <span>JSON 내보내기</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
              <RefreshCw className={cn('size-3.5', query.isFetching && 'animate-spin')} />
              <span>새로고침</span>
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-2 px-6 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={String(f.value)}
                type="button"
                onClick={() => {
                  setStatusFilter(f.value);
                  setPage(1);
                }}
                className={cn(
                  'inline-flex h-[30px] items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors',
                  active
                    ? 'border-primary bg-accent text-accent-foreground'
                    : cn(
                        'border-dashed border-[var(--hb-border-strong)] bg-card hover:border-primary',
                        f.cls,
                      ),
                )}
              >
                <span>{f.label}</span>
              </button>
            );
          })}
          <span className="mx-1 h-5 w-px bg-border" />
          {METHOD_FILTERS.map((m) => {
            const active = methodFilter === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMethodFilter(active ? null : m);
                  setPage(1);
                }}
                className={cn(
                  'inline-flex h-[30px] items-center rounded-full border px-3 text-xs font-semibold transition-colors',
                  active
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-dashed border-[var(--hb-border-strong)] bg-card text-foreground/80 hover:border-primary',
                )}
              >
                {m}
              </button>
            );
          })}
          <span className="mx-1 h-5 w-px bg-border" />
          {RANGE_FILTERS.map((r) => {
            const active = range === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => {
                  setRange(r.value);
                  setPage(1);
                }}
                className={cn(
                  'inline-flex h-[30px] items-center rounded-full border px-3 text-xs font-semibold transition-colors',
                  active
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-dashed border-[var(--hb-border-strong)] bg-card text-foreground/80 hover:border-primary',
                )}
              >
                {r.label}
              </button>
            );
          })}
          <span className="flex-1" />
          <span className="text-[11px] font-semibold text-muted-foreground">
            {fmtNumber(items.length)}건 표시 중
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={uri}
              onChange={(e) => {
                setUri(e.target.value);
                setPage(1);
              }}
              placeholder="URI 패턴 (예: /api/users)"
              className="h-8 pl-7 font-mono text-xs"
            />
          </div>
          <div className="relative w-56">
            <Input
              value={errorCode}
              onChange={(e) => {
                setErrorCode(e.target.value);
                setPage(1);
              }}
              placeholder="errorCode (예: NOT_FOUND)"
              className="h-8 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8" />
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-40">일시</TableHead>
                <TableHead className="w-16">METHOD</TableHead>
                <TableHead className="min-w-[280px]">URI</TableHead>
                <TableHead className="w-16">상태</TableHead>
                <TableHead className="w-40">코드</TableHead>
                <TableHead className="min-w-[320px]">메시지</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <EmptyState
                      title="조건에 맞는 에러 로그가 없습니다."
                      description="필터를 초기화해 보세요."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((e) => (
                  <ErrorRows
                    key={e.id}
                    log={e}
                    expanded={expanded === e.id}
                    onToggle={() => setExpanded(expanded === e.id ? null : e.id)}
                  />
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center gap-3 border-t border-border bg-card px-4 py-3 text-xs font-medium text-muted-foreground">
            <span className="tabular-nums">
              {totalElements > 0
                ? `${fmtNumber((page - 1) * size + 1)}–${fmtNumber(Math.min(page * size, totalElements))}`
                : '0'}{' '}
              / {fmtNumber(totalElements)}
            </span>
            <span className="flex-1" />
            <span className="flex items-center gap-1.5">
              페이지 크기
              <select
                value={size}
                onChange={(ev) => {
                  setSize(Number(ev.target.value));
                  setPage(1);
                }}
                className="h-7 rounded-md border border-input bg-card px-2 text-xs"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ErrorRows({
  log,
  expanded,
  onToggle,
}: {
  log: ErrorLog;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow className="cursor-pointer" onClick={onToggle}>
        <TableCell className="pr-0 text-muted-foreground">
          <ChevronDown
            className={cn('size-3 transition-transform', !expanded && '-rotate-90')}
          />
        </TableCell>
        <TableCell className="font-mono tabular-nums text-muted-foreground">#{log.id}</TableCell>
        <TableCell className="whitespace-nowrap font-mono text-[11px] tabular-nums text-muted-foreground">
          {fmtDateTime(log.createdAt)}
        </TableCell>
        <TableCell>
          <MethodBadge method={log.method} />
        </TableCell>
        <TableCell className="whitespace-nowrap font-mono text-xs">{log.uri}</TableCell>
        <TableCell>
          <StatusCodeBadge code={log.status} />
        </TableCell>
        <TableCell className="whitespace-nowrap font-mono text-[11px] font-bold text-[var(--hb-red-700)]">
          {log.errorCode || '—'}
        </TableCell>
        <TableCell className="whitespace-nowrap text-foreground/90">{log.message}</TableCell>
      </TableRow>
      <TableRow className={cn('hover:bg-transparent', !expanded && 'border-0')}>
        <TableCell colSpan={8} className="h-auto p-0">
          <div
            className={cn(
              'grid transition-[grid-template-rows] duration-300 ease-out',
              expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div className="overflow-hidden">
              <div
                className={cn(
                  'bg-muted/40 px-4 py-4 pl-12 transition-[opacity,transform] duration-200 ease-out',
                  expanded
                    ? 'translate-y-0 opacity-100 delay-75'
                    : '-translate-y-1 opacity-0',
                )}
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      Stack Trace
                    </div>
                    <pre className="m-0 max-h-52 overflow-auto rounded-md bg-[var(--hb-fg-1)] p-3 font-mono text-[11px] leading-relaxed text-[var(--hb-cyan-100)]">
                      {log.stackTrace || '—'}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      Request Body
                    </div>
                    {log.requestBody ? (
                      <pre className="m-0 max-h-52 overflow-auto rounded-md border border-border bg-muted p-3 font-mono text-[11px] leading-relaxed text-foreground">
                        {log.requestBody}
                      </pre>
                    ) : (
                      <div className="rounded-md border border-dashed border-border p-3 text-xs italic text-muted-foreground/70">
                        요청 본문 없음
                      </div>
                    )}
                    <div className="mt-2.5 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          navigator.clipboard?.writeText(JSON.stringify(log, null, 2))
                        }
                      >
                        <Copy className="size-3" />
                        <span>전체 복사</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
