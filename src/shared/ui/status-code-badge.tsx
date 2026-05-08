import { cn } from '@/shared/lib/utils';

export function StatusCodeBadge({ code }: { code: number }) {
  const cls =
    code >= 500
      ? 'bg-[var(--hb-red-100)] text-[var(--hb-red-700)]'
      : code >= 400
        ? 'bg-[var(--hb-yellow-100)] text-[var(--hb-yellow-700)]'
        : code >= 200
          ? 'bg-[var(--hb-green-100)] text-[var(--hb-green-900)]'
          : 'bg-muted text-foreground';
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-[38px] items-center justify-center rounded px-1.5 font-mono text-[11px] font-bold tabular-nums',
        cls,
      )}
    >
      {code}
    </span>
  );
}
