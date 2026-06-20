import { cn } from '@/lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: CardPadding;
  hover?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export function Card({ children, className, padding = 'md', hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-card border border-border shadow-card',
        'transition-shadow duration-200',
        hover && 'hover:shadow-card-hover cursor-pointer',
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
