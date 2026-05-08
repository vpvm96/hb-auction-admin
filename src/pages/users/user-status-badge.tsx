import { Badge } from '@/shared/ui/badge';
import type { UserStatus } from '@/entities/user/model/types';

const LABEL: Record<UserStatus, string> = {
  Active: '활성',
  Suspended: '정지',
  Deleted: '삭제됨',
};

const VARIANT: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  Active: 'success',
  Suspended: 'warning',
  Deleted: 'danger',
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
