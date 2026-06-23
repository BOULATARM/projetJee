'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Bell, LogOut, Menu } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { notificationService } from '@/services/notification.service';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LangToggle } from '@/components/ui/LangToggle';
import { useT } from '@/hooks/useT';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { nom, prenom, role, photo, logout } = useAuthStore();
  const router = useRouter();
  const t = useT();
  const [notifCount, setNotifCount] = useState(0);

  const fetchNotifCount = useCallback(async () => {
    try {
      const notifs = await notificationService.getNonLues();
      setNotifCount(notifs.length);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30_000);
    window.addEventListener('notif-lue', fetchNotifCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notif-lue', fetchNotifCount);
    };
  }, [fetchNotifCount]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition-colors md:hidden"
            aria-label={t.header.openMenu}
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-100 hidden sm:block">
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
        <ThemeToggle />
        <LangToggle />

        <Link
          href="/dashboard/notifications"
          className={cn(
            'relative rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition-colors',
          )}
          aria-label={
            notifCount > 0
              ? `${notifCount} ${t.header.notifications.toLowerCase()}${notifCount > 1 ? 's' : ''}`
              : t.header.notifications
          }
        >
          <Bell size={19} />
          {notifCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </Link>

        <Link
          href="/dashboard/profil"
          className="rounded-lg p-1 hover:opacity-80 transition-opacity"
          aria-label={t.header.myProfile}
        >
          <Avatar photo={photo} nom={nom} prenom={prenom} size={32} />
        </Link>

        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-danger dark:text-stone-400 dark:hover:bg-stone-800 transition-colors"
          aria-label={t.header.logout}
          title={t.header.logout}
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
}
