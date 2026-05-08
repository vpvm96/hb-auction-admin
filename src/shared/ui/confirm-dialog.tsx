import { AlertTriangle, Info } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from './button';
import { Dialog, DialogContent } from './dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger = false,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false}>
        <div className="flex items-start gap-3">
          <span
            className={
              danger
                ? 'inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-[var(--hb-red-100)] text-[var(--hb-red-700)]'
                : 'inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground'
            }
          >
            {danger ? <AlertTriangle className="size-5" /> : <Info className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold tracking-tight">{title}</div>
            {description ? (
              <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {description}
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant={danger ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '처리 중…' : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
