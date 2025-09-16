import React from 'react';
import { cn } from '@lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    leftIcon,
    rightIcon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center gap-2',
      'font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95'
    ];

    const variants = {
      primary: [
        'bg-[var(--brand-primary)] text-white',
        'hover:bg-[var(--brand-primary)]/90',
        'focus:ring-[var(--brand-primary)]/50',
        'shadow-sm'
      ],
      secondary: [
        'bg-[var(--brand-secondary)] text-white',
        'hover:bg-[var(--brand-secondary)]/90',
        'focus:ring-[var(--brand-secondary)]/50',
        'shadow-sm'
      ],
      outline: [
        'border border-[var(--border)] bg-transparent',
        'text-[var(--text-primary)]',
        'hover:bg-[var(--bg-muted)]',
        'focus:ring-[var(--focus)]/50'
      ],
      ghost: [
        'bg-transparent text-[var(--text-primary)]',
        'hover:bg-[var(--bg-muted)]',
        'focus:ring-[var(--focus)]/50'
      ],
      danger: [
        'bg-[var(--danger)] text-white',
        'hover:bg-[var(--danger)]/90',
        'focus:ring-[var(--danger)]/50',
        'shadow-sm'
      ]
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg'
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
