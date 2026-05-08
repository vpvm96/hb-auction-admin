import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { NavLink } from 'react-router';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fmtNumber } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import { NAV_GROUPS } from './nav-config';
import { useNavCounts } from './use-nav-counts';

interface SideNavState {
  mini: boolean;
  toggle: () => void;
}

const useSideNavStore = create<SideNavState>()(
  persist(
    (set) => ({
      mini: false,
      toggle: () => set((s) => ({ mini: !s.mini })),
    }),
    { name: 'hb-admin-side-nav' },
  ),
);

export function SideNav() {
  const mini = useSideNavStore((s) => s.mini);
  const toggle = useSideNavStore((s) => s.toggle);
  const counts = useNavCounts();

  return (
    <nav
      className={cn(
        'sticky top-14 flex h-[calc(100vh-3.5rem)] shrink-0 flex-col gap-1 border-r border-border bg-card p-2 transition-[width] duration-200',
        mini ? 'w-16' : 'w-60',
      )}
    >
      {NAV_GROUPS.map((group, gi) => (
        <div key={group.title} className={cn('flex flex-col gap-0.5', gi > 0 && 'mt-3')}>
          {!mini ? (
            <div className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">
              {group.title}
            </div>
          ) : null}

          {group.items.map((item) => {
            const Icon = item.icon;
            const count = item.countKey ? counts[item.countKey] : undefined;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={mini ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex h-9 items-center gap-2.5 rounded-md text-sm transition-colors',
                    mini ? 'justify-center px-0' : 'px-3',
                    isActive
                      ? 'bg-accent font-bold text-accent-foreground'
                      : 'font-medium text-foreground/90 hover:bg-secondary',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="size-4" />
                    {!mini ? (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {count != null ? (
                          <CountBadge
                            count={count}
                            active={isActive}
                            flagged={item.edge === 'flagged'}
                          />
                        ) : null}
                      </>
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      ))}

      <div className="flex-1" />

      <button
        type="button"
        onClick={toggle}
        className={cn(
          'flex h-8 items-center gap-2 rounded-md text-xs text-muted-foreground transition-colors hover:bg-secondary',
          mini ? 'justify-center' : 'px-3',
        )}
      >
        {mini ? <ChevronsRight className="size-3.5" /> : <ChevronsLeft className="size-3.5" />}
        {!mini ? <span>접기</span> : null}
      </button>
    </nav>
  );
}

function CountBadge({
  count,
  active,
  flagged,
}: {
  count: number;
  active: boolean;
  flagged: boolean;
}) {
  const cls = flagged
    ? 'bg-[var(--hb-red-500)] text-white'
    : active
      ? 'bg-primary text-primary-foreground'
      : 'bg-muted text-foreground';
  return (
    <span
      className={cn(
        'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums',
        cls,
      )}
    >
      {fmtNumber(count)}
    </span>
  );
}
