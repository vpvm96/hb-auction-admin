import { CheckSquare, Edit2, Layout, Smartphone, Trash2, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from '@/shared/ui/button';
import { fmtDateTime } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import type {
  NotificationTemplate,
  TemplateChannel,
} from '@/entities/notification-template/model/types';

const CHANNEL_STYLE: Record<
  TemplateChannel,
  { wrap: string; Icon: LucideIcon }
> = {
  Push: {
    wrap: 'bg-[var(--hb-indigo-100)] text-[var(--hb-indigo-700)]',
    Icon: Smartphone,
  },
  InApp: {
    wrap: 'bg-[var(--hb-cyan-50)] text-[var(--hb-cyan-700)]',
    Icon: Layout,
  },
  Both: {
    wrap: 'bg-[var(--hb-green-100)] text-[var(--hb-green-900)]',
    Icon: CheckSquare,
  },
};

/** Highlight {{var}} tokens inside template strings. */
function highlightVars(s: string): ReactNode[] {
  return s.split(/(\{\{[a-zA-Z_]+\}\})/).map((p, i) =>
    /^\{\{/.test(p) ? (
      <code
        key={i}
        className="rounded-sm bg-[var(--hb-yellow-100)] px-1 font-mono text-[11px] font-bold text-[var(--hb-yellow-700)]"
      >
        {p}
      </code>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

interface TemplateCardProps {
  template: NotificationTemplate;
  onEdit: () => void;
  onDelete: () => void;
}

export function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const ch = CHANNEL_STYLE[template.channel] ?? CHANNEL_STYLE.Push;
  const Icon = ch.Icon;
  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-[var(--hb-border-strong)]">
      <div className="px-4 pb-2.5 pt-3.5">
        <div className="mb-2 flex items-center gap-2">
          <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs font-bold text-foreground">
            {template.templateKey}
          </code>
          <span className="flex-1" />
          <span
            className={cn(
              'inline-flex h-5 items-center gap-1 rounded px-2 text-[10px] font-bold tracking-wider',
              ch.wrap,
            )}
          >
            <Icon className="size-2.5" />
            {template.channel.toUpperCase()}
          </span>
        </div>
        <div className="text-sm font-bold leading-snug text-foreground">
          {highlightVars(template.titleTemplate)}
        </div>
        <div className="mt-1.5 text-xs leading-relaxed text-foreground/80">
          {highlightVars(template.bodyTemplate)}
        </div>
      </div>
      <div className="flex items-center gap-1.5 border-t border-border/50 px-3 py-2">
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          업데이트 {fmtDateTime(template.updatedAt)}
        </span>
        <span className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px]"
          onClick={onEdit}
        >
          <Edit2 className="size-3" />
          <span>수정</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 px-0 text-[var(--hb-red-700)]"
          onClick={onDelete}
          title="삭제"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}
