import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary-light text-primary-700',
  success: 'bg-success-light text-success-text',
  warning: 'bg-warning-light text-warning-text',
  danger:  'bg-danger-light  text-danger-text',
  info:    'bg-info-light    text-info-text',
  neutral: 'bg-stone-100     text-stone-600',
};

export function Badge({ children, className, variant }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant ? variantClasses[variant] : '',
        className,
      )}
    >
      {children}
    </span>
  );
}
