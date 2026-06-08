'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setChecked(true);
  }, [loadFromStorage]);

  useEffect(() => {
    if (!checked) return;
    if (!isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, router, checked]);

  if (!checked || (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('token'))) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">Chargement...</div></div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
      <div className={cn('flex-1 transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
