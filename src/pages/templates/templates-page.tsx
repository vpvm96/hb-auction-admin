import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
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

export function TemplatesPage() {
  const [editor, setEditor] = useState<TemplateEditorState | null>(null);
  const [confirmDel, setConfirmDel] = useState<NotificationTemplate | null>(null);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: templatesKeys.list(),
    queryFn: () => templatesApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => templatesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templatesKeys.all });
      setConfirmDel(null);
    },
  });

  const all = query.data ?? [];
  const lower = searchQuery.toLowerCase();
  const filtered = all.filter((t) => {
    if (channelFilter && t.channel !== channelFilter) return false;
    if (lower && !t.templateKey.toLowerCase().includes(lower) && !t.titleTemplate.includes(searchQuery))
      return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="알림 템플릿"
        description={`총 ${fmtNumber(all.length)}개 · 키 기준 오름차순 (snake_case)`}
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
        {query.isLoading ? (
          <div className="rounded-md border border-border bg-card p-12 text-center text-sm text-muted-foreground">
            불러오는 중…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border border-border bg-card">
            <EmptyState
              title={
                all.length === 0
                  ? '등록된 알림 템플릿이 없습니다.'
                  : '조건에 맞는 템플릿이 없습니다.'
              }
              description={
                all.length === 0
                  ? '‘템플릿 추가’ 버튼으로 새 템플릿을 만드세요.'
                  : '필터를 초기화하거나 새 템플릿을 추가하세요.'
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-3">
            {filtered.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onEdit={() => setEditor({ mode: 'edit', template: t })}
                onDelete={() => setConfirmDel(t)}
              />
            ))}
          </div>
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
