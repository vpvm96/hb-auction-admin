import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps } from 'react';
import { cn } from '@/shared/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 h-[22px] text-xs font-bold tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        primary: 'bg-accent text-accent-foreground',
        success: 'bg-[var(--hb-green-100)] text-[var(--hb-green-900)]',
        warning: 'bg-[var(--hb-yellow-100)] text-[var(--hb-yellow-700)]',
        danger: 'bg-[var(--hb-red-100)] text-[var(--hb-red-700)]',
        info: 'bg-[var(--hb-indigo-100)] text-[var(--hb-indigo-700)]',
        outline: 'border border-border text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

interface BadgeProps extends ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
