'use client';
import { useState } from 'react';

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

  const style = { width: size, height: size, minWidth: size, fontSize: size * 0.35 };

  if (src && !error) {
    return (
      <img
        src={src}
        alt={`${prenom} ${nom}`}
        style={style}
        className={`rounded-full object-cover ${className}`}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div
      style={style}
      className={`rounded-full bg-primary flex items-center justify-center text-white font-bold select-none ${className}`}
    >
      {initials}
    </div>
  );
}
