import { useQuery } from '@tanstack/react-query';
import { Lock, Unlock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';
import { fmtDateTime } from '@/shared/lib/format';
import { usersApi, usersKeys } from '@/entities/user/api/users.api';
import type { User } from '@/entities/user/model/types';
import { UserStatusBadge } from './user-status-badge';

interface UserDetailDrawerProps {
  userId: string | null;
  fallback: User | undefined;
  onClose: () => void;
}

export function UserDetailDrawer({ userId, fallback, onClose }: UserDetailDrawerProps) {
  const open = userId != null;
  const detail = useQuery({
    queryKey: userId ? usersKeys.detail(userId) : ['users', 'detail', 'null'],
    queryFn: () => usersApi.get(userId!),
    enabled: open,
    initialData: fallback,
  });

  const user = detail.data;
  const showFooter = user?.status === 'Active' || user?.status === 'Suspended';

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent>
        <SheetHeader>
          {user ? (
            <>
              <Avatar className="size-8">
                <AvatarFallback>{user.nickname?.[0] ?? '?'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <SheetTitle className="truncate text-sm">{user.nickname}</SheetTitle>
                <SheetDescription className="truncate font-mono text-[11px]">
                  {user.email}
                </SheetDescription>
              </div>
            </>
          ) : (
            <SheetTitle className="text-sm font-medium text-muted-foreground">
              불러오는 중…
            </SheetTitle>
          )}
        </SheetHeader>

        <SheetBody>{user ? <UserDetail user={user} /> : null}</SheetBody>

        {showFooter ? (
          <SheetFooter>
            {user?.status === 'Active' ? (
              <Button
                variant="secondary"
                size="sm"
                className="text-[var(--hb-yellow-700)]"
                disabled
              >
                <Lock className="size-3.5" />
                <span>정지</span>
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="text-[var(--hb-green-700)]"
                disabled
              >
                <Unlock className="size-3.5" />
                <span>정지 해제</span>
              </Button>
            )}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function UserDetail({ user }: { user: User }) {
  return (
    <div className="flex flex-col gap-5">
      <Section title="기본 정보">
        <Field label="UUID">
          <span className="break-all font-mono text-xs">{user.id}</span>
        </Field>
        <Field label="이메일">
          <span className="font-mono text-sm">{user.email}</span>
        </Field>
        <Field label="닉네임">{user.nickname}</Field>
        <Field label="상태">
          <UserStatusBadge status={user.status} />
        </Field>
        <Field label="약관 동의">
          <span className="tabular-nums">v{user.agreedTermsVersion}</span>
        </Field>
      </Section>

      <Section title="활동">
        <Field label="가입일시">
          <span className="font-mono text-sm tabular-nums">{fmtDateTime(user.createdAt)}</span>
        </Field>
        <Field label="삭제일시">
          {user.deletedAt ? (
            <span className="font-mono text-sm tabular-nums">{fmtDateTime(user.deletedAt)}</span>
          ) : (
            <span className="text-muted-foreground/60">—</span>
          )}
        </Field>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        {title}
      </div>
      <div className="overflow-hidden rounded-md border border-border">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3 border-b border-border/50 px-3 py-2.5 text-sm last:border-0">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}
