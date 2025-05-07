import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        income: 'bg-green-100 text-green-700',
        expense: 'bg-red-100 text-red-700',
        investment: 'bg-indigo-100 text-indigo-700',
        active: 'bg-emerald-100 text-emerald-700',
        pending: 'bg-amber-100 text-amber-700',
        canceled: 'bg-gray-100 text-gray-700',
        trial: 'bg-blue-100 text-blue-700',
        expired: 'bg-rose-100 text-rose-700',
      },
      size: {
        sm: 'text-xs py-0 px-2',
        md: 'text-xs py-0.5 px-2.5',
        lg: 'text-sm py-1 px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  label: string;
}

export function StatusBadge({ className, variant, size, label, ...props }: StatusBadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {label}
    </div>
  );
}