import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
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

type PendingAction = 'suspend' | 'activate' | null;

interface UserDetailDrawerProps {
  userId: string | null;
  fallback: User | undefined;
  onClose: () => void;
}

export function UserDetailDrawer({ userId, fallback, onClose }: UserDetailDrawerProps) {
  const open = userId != null;
  const qc = useQueryClient();
  const [pending, setPending] = useState<PendingAction>(null);

  const detail = useQuery({
    queryKey: userId ? usersKeys.detail(userId) : ['users', 'detail', 'null'],
    queryFn: () => usersApi.get(userId!),
    enabled: open,
    initialData: fallback,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: Exclude<PendingAction, null> }) =>
      action === 'suspend' ? usersApi.suspend(id) : usersApi.activate(id),
    onSuccess: (updated) => {
      qc.setQueryData(usersKeys.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: usersKeys.all });
      setPending(null);
    },
  });

  const user = detail.data;
  const showFooter = user?.status === 'Active' || user?.status === 'Suspended';

  const errorMessage = pending && statusMutation.isError ? extractError(statusMutation.error) : null;

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setPending(null);
            statusMutation.reset();
            onClose();
          }
        }}
      >
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
                  onClick={() => setPending('suspend')}
                >
                  <Lock className="size-3.5" />
                  <span>정지</span>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-[var(--hb-green-700)]"
                  onClick={() => setPending('activate')}
                >
                  <Unlock className="size-3.5" />
                  <span>정지 해제</span>
                </Button>
              )}
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={pending != null}
        onOpenChange={(v) => {
          if (!v) {
            setPending(null);
            statusMutation.reset();
          }
        }}
        title={
          pending === 'suspend'
            ? '사용자 계정을 정지합니다.'
            : pending === 'activate'
              ? '사용자 정지를 해제합니다.'
              : ''
        }
        description={
          <div className="space-y-1.5">
            <div>
              {user ? (
                <>
                  <span className="font-semibold text-foreground">{user.nickname}</span>
                  <span className="text-muted-foreground"> · {user.email}</span>
                </>
              ) : null}
            </div>
            <div>
              {pending === 'suspend'
                ? '정지된 사용자는 로그인 및 서비스 이용이 제한됩니다.'
                : '활성화하면 사용자가 다시 서비스를 이용할 수 있습니다.'}
            </div>
            {errorMessage ? (
              <div className="text-[var(--hb-red-700)]">{errorMessage}</div>
            ) : null}
          </div>
        }
        confirmLabel={pending === 'suspend' ? '정지' : '정지 해제'}
        danger={pending === 'suspend'}
        loading={statusMutation.isPending}
        onConfirm={() => {
          if (!user || !pending) return;
          statusMutation.mutate({ id: user.id, action: pending });
        }}
      />
    </>
  );
}

function extractError(error: unknown): string {
  if (isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    if (detail) return detail;
    if (error.response?.status === 404) return '사용자를 찾을 수 없습니다.';
    if (error.response?.status === 400) return '요청을 처리할 수 없습니다.';
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
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
