import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Plus, Shuffle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { EmptyState } from '@/shared/ui/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { fmtDateTime, fmtNumber } from '@/shared/lib/format';
import { quizzesApi, quizzesKeys } from '@/entities/quiz/api/quizzes.api';
import type { Quiz } from '@/entities/quiz/model/types';
import { PageHeader } from '@/widgets/page-header/page-header';
import { QuizEditorDrawer, type QuizEditorState } from './quiz-editor-drawer';

export function QuizzesPage() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [editor, setEditor] = useState<QuizEditorState | null>(null);
  const [confirmDel, setConfirmDel] = useState<Quiz | null>(null);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: quizzesKeys.list({ page, size }),
    queryFn: () => quizzesApi.list({ page, size }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => quizzesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quizzesKeys.all });
      setConfirmDel(null);
    },
  });

  const items = query.data?.items ?? [];
  const totalElements = query.data?.totalElements ?? 0;
  const totalPages = query.data?.totalPages ?? 1;

  const columns: ColumnDef<Quiz>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          #{getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: 'question',
      header: '질문',
      cell: ({ getValue }) => (
        <span className="line-clamp-1 max-w-[420px] font-semibold">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'choices',
      header: '정답',
      cell: ({ row }) => {
        const choices = row.original.choices ?? [];
        const correct = choices[row.original.correctIndex];
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex size-5 items-center justify-center rounded bg-[var(--hb-green-100)] font-mono text-[11px] font-bold tabular-nums text-[var(--hb-green-900)]">
              {row.original.correctIndex + 1}
            </span>
            <span className="line-clamp-1 max-w-[200px] text-[13px]">{correct}</span>
          </div>
        );
      },
    },
    {
      id: 'choices-count',
      header: '선택지',
      cell: ({ row }) => (
        <span className="block text-center font-mono text-xs text-muted-foreground">
          {row.original.choices?.length ?? 0}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: '생성일시',
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
          {fmtDateTime(getValue<string>())}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-[var(--hb-red-700)]"
            title="삭제"
            onClick={() => setConfirmDel(row.original)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <PageHeader
        title="퀴즈"
        description={`총 ${fmtNumber(totalElements)}개 · 4지선다, 정답 인덱스 0~3`}
        breadcrumb={['관리자', '콘텐츠', '퀴즈']}
        actions={
          <>
            <Button variant="secondary" size="sm">
              <Shuffle className="size-3.5" />
              <span>랜덤 미리보기</span>
            </Button>
            <Button size="sm" onClick={() => setEditor({ mode: 'create' })}>
              <Plus className="size-3.5" />
              <span>퀴즈 추가</span>
            </Button>
          </>
        }
      />

      <div className="px-6 pb-6">
        <Card className="overflow-hidden">
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
                      title="등록된 퀴즈가 없습니다."
                      description="‘퀴즈 추가’ 버튼으로 새 퀴즈를 만드세요."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => setEditor({ mode: 'edit', quiz: row.original })}
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

      <QuizEditorDrawer state={editor} onClose={() => setEditor(null)} />

      <ConfirmDialog
        open={confirmDel != null}
        onOpenChange={(v) => !v && setConfirmDel(null)}
        title={confirmDel ? `퀴즈 #${confirmDel.id}을 삭제합니다.` : ''}
        description="이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => confirmDel && deleteMutation.mutate(confirmDel.id)}
      />
    </div>
  );
}
