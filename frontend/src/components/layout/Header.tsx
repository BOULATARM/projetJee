'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Bell, LogOut, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { notificationService } from '@/services/notification.service';
import Link from 'next/link';

export function Header() {
  const { nom, prenom, role, logout } = useAuthStore();
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
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-heading font-semibold text-gray-800">
          {prenom} {nom}
        </h2>
        <span className="bg-primary text-white text-xs px-2 py-1 rounded">{role}</span>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/dashboard/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell size={20} className="text-gray-600" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </Link>

        <Link href="/dashboard/profil" className="p-2 hover:bg-gray-100 rounded-lg">
          <User size={20} className="text-gray-600" />
        </Link>

        <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg">
          <LogOut size={20} className="text-gray-600" />
        </button>
      </div>
    </header>
  );
}
