import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/features/auth/model/auth-store';

export function TopNav() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-5 border-b border-border bg-card px-5">
      <div className="flex items-center gap-2.5">
        <img src="/logo.png" alt="HB Auction" className="h-8 w-auto object-contain" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight text-[#1F3B5C]">HB Auction</span>
          <span className="mt-0.5 text-[9px] font-semibold tracking-[0.1em] text-muted-foreground">
            ADMIN CONSOLE
          </span>
        </div>
      </div>

      <div className="h-5 w-px bg-border" />

      <span className="rounded bg-muted px-2 py-[3px] text-[11px] font-bold tracking-wider text-muted-foreground">
        {env.env} · {new URL(env.apiBaseUrl).host}
      </span>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Avatar className="size-7">
          <AvatarFallback>{user?.name?.[0] ?? '?'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold">{user?.name ?? '게스트'}</span>
          <span className="text-[10px] text-muted-foreground">{user?.email ?? ''}</span>
        </div>
      </div>
    </header>
  );
}
