'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  photo?: string | null;
  nom?: string | null;
  prenom?: string | null;
  size?: number;
  className?: string;
}

const PHOTO_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:8080';

export function Avatar({ photo, nom, prenom, size = 40, className = '' }: AvatarProps) {
  const [error, setError] = useState(false);

  const initials =
    `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase() || '?';

  const src = photo
    ? photo.startsWith('http')
      ? photo
      : `${PHOTO_BASE}/uploads/${photo.replace(/^\/?(uploads\/)?/, '')}`
    : null;

  const style = {
    width: size,
    height: size,
    minWidth: size,
    fontSize: Math.max(10, Math.round(size * 0.36)),
  };

  if (src && !error) {
    return (
      <img
        src={src}
        alt={`${prenom ?? ''} ${nom ?? ''}`.trim()}
        style={style}
        className={cn('rounded-full object-cover ring-2 ring-white', className)}
        onError={() => setError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      style={style}
      className={cn(
        'rounded-full flex items-center justify-center select-none font-semibold',
        'bg-primary-100 text-primary-800 ring-2 ring-white',
        className,
      )}
    >
      {initials}
    </div>
  );
}
