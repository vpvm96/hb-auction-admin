import { Inbox } from 'lucide-react';
import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="px-6 py-16 text-center text-muted-foreground">
      <div className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-muted">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {description ? <div className="mt-1 text-xs">{description}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
