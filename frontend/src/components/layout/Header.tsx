'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Bell, LogOut, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { notificationService } from '@/services/notification.service';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { nom, prenom, role, photo, logout } = useAuthStore();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const notifs = await notificationService.getNonLues();
        setNotifCount(notifs.length);
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile seulement */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors md:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-800 hidden sm:block">
            {prenom} {nom}
          </span>
          {role && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
              {role}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Link
          href="/dashboard/notifications"
          className={cn(
            'relative rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors',
          )}
          aria-label="Notifications"
        >
          <Bell size={19} />
          {notifCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </Link>

        <Link
          href="/dashboard/profil"
          className="rounded-lg p-1 hover:opacity-80 transition-opacity"
          aria-label="Mon profil"
        >
          <Avatar photo={photo} nom={nom} prenom={prenom} size={32} />
        </Link>

        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-danger transition-colors"
          aria-label="Se déconnecter"
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
}
