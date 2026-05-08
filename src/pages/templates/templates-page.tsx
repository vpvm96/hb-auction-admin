import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { fmtNumber } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import {
  templatesApi,
  templatesKeys,
} from '@/entities/notification-template/api/templates.api';
import type {
  NotificationTemplate,
  TemplateChannel,
} from '@/entities/notification-template/model/types';
import { PageHeader } from '@/widgets/page-header/page-header';
import { TemplateCard } from './template-card';
import { TemplateEditorDrawer, type TemplateEditorState } from './template-editor-drawer';

type ChannelFilter = TemplateChannel | null;

const CHANNEL_FILTERS: { value: ChannelFilter; label: string }[] = [
  { value: null, label: '전체' },
  { value: 'Push', label: 'Push' },
  { value: 'InApp', label: 'InApp' },
  { value: 'Both', label: 'Both' },
];

const PAGE_SIZE = 20;

export function TemplatesPage() {
  const [editor, setEditor] = useState<TemplateEditorState | null>(null);
  const [confirmDel, setConfirmDel] = useState<NotificationTemplate | null>(null);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const qc = useQueryClient();

  const filterParams = {
    channel: channelFilter ?? undefined,
    keyword: searchQuery.trim() || undefined,
  };

  const query = useInfiniteQuery({
    queryKey: templatesKeys.list({ ...filterParams, size: PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      templatesApi.list({ ...filterParams, page: pageParam, size: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => templatesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templatesKeys.all });
      setConfirmDel(null);
    },
  });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const totalElements = query.data?.pages[0]?.totalElements ?? 0;

  // IntersectionObserver로 sentinel이 보이면 다음 페이지 자동 fetch
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage, items.length]);

  const isInitialLoading = query.isLoading;
  const noFilters = !channelFilter && !searchQuery.trim();

  return (
    <div>
      <PageHeader
        title="알림 템플릿"
        description={`총 ${fmtNumber(totalElements)}개 · 키 기준 오름차순 (snake_case)`}
        breadcrumb={['관리자', '콘텐츠', '알림 템플릿']}
        actions={
          <>
            <Button variant="secondary" size="sm">
              <Search className="size-3.5" />
              <span>키 조회</span>
            </Button>
            <Button size="sm" onClick={() => setEditor({ mode: 'create' })}>
              <Plus className="size-3.5" />
              <span>템플릿 추가</span>
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-2 px-6 pb-3">
        <div className="flex gap-1.5">
          {CHANNEL_FILTERS.map((f) => {
            const active = channelFilter === f.value;
            return (
              <button
                key={String(f.value)}
                type="button"
                onClick={() => setChannelFilter(f.value)}
                className={cn(
                  'inline-flex h-[30px] items-center rounded-full border px-3 text-xs font-semibold transition-colors',
                  active
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-dashed border-[var(--hb-border-strong)] bg-card text-foreground/80 hover:border-primary',
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <span className="flex-1" />
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="템플릿 키 또는 제목"
            className="h-8 pl-7 text-xs"
          />
        </div>
      </div>

      <div className="px-6 pb-6">
        {isInitialLoading ? (
          <div className="rounded-md border border-border bg-card p-12 text-center text-sm text-muted-foreground">
            불러오는 중…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-md border border-border bg-card">
            <EmptyState
              title={
                noFilters
                  ? '등록된 알림 템플릿이 없습니다.'
                  : '조건에 맞는 템플릿이 없습니다.'
              }
              description={
                noFilters
                  ? '‘템플릿 추가’ 버튼으로 새 템플릿을 만드세요.'
                  : '필터를 초기화하거나 새 템플릿을 추가하세요.'
              }
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-3">
              {items.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onEdit={() => setEditor({ mode: 'edit', template: t })}
                  onDelete={() => setConfirmDel(t)}
                />
              ))}
            </div>

            <div
              ref={sentinelRef}
              className="mt-4 flex h-12 items-center justify-center text-[11px] font-semibold text-muted-foreground"
            >
              {query.isFetchingNextPage ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin" />
                  더 불러오는 중…
                </span>
              ) : query.hasNextPage ? (
                <button
                  type="button"
                  onClick={() => query.fetchNextPage()}
                  className="rounded-md border border-dashed border-border bg-card px-3 py-1.5 hover:border-primary"
                >
                  더 보기
                </button>
              ) : (
                <span className="opacity-60">
                  마지막입니다 · 총 {fmtNumber(totalElements)}건
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <TemplateEditorDrawer state={editor} onClose={() => setEditor(null)} />

      <ConfirmDialog
        open={confirmDel != null}
        onOpenChange={(v) => !v && setConfirmDel(null)}
        title={
          confirmDel ? (
            <>
              템플릿 <code className="font-mono">{confirmDel.templateKey}</code>을 삭제합니다.
            </>
          ) : (
            ''
          )
        }
        description="이 템플릿을 사용하는 알림 발송이 영향을 받을 수 있습니다. 되돌릴 수 없습니다."
        confirmLabel="삭제"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => confirmDel && deleteMutation.mutate(confirmDel.id)}
      />
    </div>
  );
}
