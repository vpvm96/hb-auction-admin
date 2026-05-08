import * as LabelPrimitive from '@radix-ui/react-label';
import { type ComponentProps } from 'react';
import { cn } from '@/shared/lib/utils';

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-xs font-semibold text-foreground/80',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  );
}
