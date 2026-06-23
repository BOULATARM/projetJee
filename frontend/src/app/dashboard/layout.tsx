'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { LayoutDashboard, MessageCircle, Bell, Menu } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const t = useT();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setSidebarCollapsed(true);
    setMounted(true);
  }, []);

  // Fermer le menu mobile à chaque changement de page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) return null;
  if (!isAuthenticated) return null;

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const mobileQuickLinks = [
    { href: '/dashboard',               label: t.mobile.home,     icon: LayoutDashboard },
    { href: '/dashboard/messages',      label: t.mobile.messages, icon: MessageCircle },
    { href: '/dashboard/notifications', label: t.mobile.notifs,   icon: Bell },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar (desktop : sticky dans le flex ; mobile : overlay) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Zone contenu principale */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setMobileMenuOpen(true)} />

        <main className={cn(
          'flex-1 overflow-y-auto scrollbar-thin',
          'p-4 md:p-6',
          'pb-20 md:pb-6', // espace pour la tab bar mobile
        )}>
          {children}
        </main>
      </div>

      {/* ── Tab bar mobile (cachée sur desktop) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border bg-surface px-2 py-2 md:hidden shadow-[0_-4px_12px_rgb(0,0,0,0.06)] dark:shadow-[0_-4px_12px_rgb(0,0,0,0.3)]">
        {mobileQuickLinks.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-stone-400 hover:text-stone-600',
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}

        {/* Bouton menu complet */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
        >
          <Menu size={20} strokeWidth={1.8} />
          {t.mobile.menu}
        </button>
      </nav>
    </div>
  );
}
