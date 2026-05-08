import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { fmtDateTime, fmtNumber } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import { usersApi, usersKeys } from '@/entities/user/api/users.api';
import type { User, UserStatus } from '@/entities/user/model/types';
import { PageHeader } from '@/widgets/page-header/page-header';
import { UserDetailDrawer } from './user-detail-drawer';
import { UserStatusBadge } from './user-status-badge';

type StatusFilter = UserStatus | null;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: null, label: '전체' },
  { value: 'Active', label: '활성' },
  { value: 'Suspended', label: '정지' },
  { value: 'Deleted', label: '삭제됨' },
];

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'UUID',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'nickname',
    header: '닉네임',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="size-6 text-[10px]">
          <AvatarFallback>{row.original.nickname?.[0] ?? '?'}</AvatarFallback>
        </Avatar>
        <span className="whitespace-nowrap font-semibold">{row.original.nickname}</span>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: '이메일',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ getValue }) => <UserStatusBadge status={getValue<UserStatus>()} />,
  },
  {
    accessorKey: 'agreedTermsVersion',
    header: '약관',
    cell: ({ getValue }) => (
      <span className="tabular-nums text-muted-foreground">v{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: '가입일시',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
        {fmtDateTime(getValue<string>())}
      </span>
    ),
  },
];

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: usersKeys.list({ page, size, status: statusFilter }),
    queryFn: () => usersApi.list({ page, size, status: statusFilter }),
    placeholderData: (prev) => prev,
  });

  const items = query.data?.items ?? [];
  const totalElements = query.data?.totalElements ?? 0;
  const totalPages = query.data?.totalPages ?? 1;

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedFromList = items.find((u) => u.id === selectedId);

  return (
    <div>
      <PageHeader
        title="사용자"
        description={`총 ${fmtNumber(totalElements)}명 · UUID 기반 식별`}
        breadcrumb={['관리자', '사용자']}
        actions={
          <Button variant="secondary" size="sm">
            <Download className="size-3.5" />
            <span>CSV 내보내기</span>
          </Button>
        }
      />

      <div className="flex items-center gap-2 border-b border-border px-6">
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
                '-mb-px flex items-center gap-1.5 border-b-2 px-1 py-2.5 text-[13px] transition-colors',
                active
                  ? 'border-primary font-bold text-foreground'
                  : 'border-transparent font-medium text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="px-6 pb-6">
        <Card className="overflow-hidden rounded-t-none border-t-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <EmptyState
                      title="조건에 해당하는 사용자가 없습니다."
                      description="다른 상태 필터로 검색해 보세요."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'cursor-pointer',
                      selectedId === row.original.id && 'bg-accent hover:bg-accent',
                    )}
                    onClick={() => setSelectedId(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
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
                onChange={(e) => {
                  setSize(Number(e.target.value));
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

      <UserDetailDrawer
        userId={selectedId}
        fallback={selectedFromList}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
