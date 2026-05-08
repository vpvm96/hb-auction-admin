import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 px-6 pb-3 pt-5">
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 ? (
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 ? <span className="text-foreground/30">/</span> : null}
                <span>{b}</span>
              </span>
            ))}
          </div>
        ) : null}
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
