import React from 'react';
import { cn } from '@lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center',
      'font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2'
    ];

    const variants = {
      default: [
        'bg-[var(--bg-muted)] text-[var(--text-primary)]',
        'hover:bg-[var(--bg-contrast)]'
      ],
      success: [
        'bg-[var(--success-light)] text-[var(--success)]',
        'border border-[var(--success)]/20'
      ],
      warning: [
        'bg-[var(--warning-light)] text-[var(--warning)]',
        'border border-[var(--warning)]/20'
      ],
      danger: [
        'bg-[var(--danger-light)] text-[var(--danger)]',
        'border border-[var(--danger)]/20'
      ],
      info: [
        'bg-[var(--info-light)] text-[var(--info)]',
        'border border-[var(--info)]/20'
      ],
      outline: [
        'border border-[var(--border)] text-[var(--text-primary)]',
        'hover:bg-[var(--bg-muted)]'
      ]
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs rounded-full',
      md: 'px-2.5 py-1 text-xs rounded-full',
      lg: 'px-3 py-1.5 text-sm rounded-full'
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
