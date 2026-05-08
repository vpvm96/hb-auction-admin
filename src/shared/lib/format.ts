import { format, formatDistanceToNowStrict } from 'date-fns';
import { ko } from 'date-fns/locale';

export function fmtDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return format(d, 'yyyy-MM-dd HH:mm:ss');
}

export function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return format(d, 'yyyy-MM-dd');
}

export function fmtRelative(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return formatDistanceToNowStrict(d, { addSuffix: true, locale: ko });
}

export function fmtNumber(value: number | null | undefined): string {
  if (value == null) return '—';
  return value.toLocaleString('ko-KR');
}
