import { cn } from '@/shared/lib/utils';

const STYLE: Record<string, string> = {
  GET: 'bg-[var(--hb-indigo-100)] text-[var(--hb-indigo-700)]',
  POST: 'bg-[var(--hb-green-100)] text-[var(--hb-green-900)]',
  PUT: 'bg-[var(--hb-yellow-100)] text-[var(--hb-yellow-700)]',
  DELETE: 'bg-[var(--hb-red-100)] text-[var(--hb-red-700)]',
  PATCH: 'bg-[var(--hb-cyan-100)] text-[var(--hb-cyan-700)]',
};

export function MethodBadge({ method }: { method: string }) {
  const style = STYLE[method] ?? 'bg-muted text-foreground';
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-[48px] items-center justify-center rounded px-1.5 font-mono text-[10px] font-extrabold tracking-wider',
        style,
      )}
    >
      {method}
    </span>
  );
}
