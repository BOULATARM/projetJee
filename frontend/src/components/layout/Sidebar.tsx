'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { RoleSysteme } from '@/types';
import {
  LayoutDashboard, Users, BookOpen, Calendar, FolderOpen, Box, Handshake,
  MessageSquare, Bell, BarChart3, FileText, ClipboardCheck, Shield, Briefcase,
  ChevronLeft, ChevronRight, GraduationCap, CalendarClock, ClipboardList,
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/membres', label: 'Membres', icon: Users, roles: ['ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/equipes', label: 'Equipes', icon: GraduationCap, roles: ['ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/publications', label: 'Publications', icon: BookOpen, roles: ['ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/evenements', label: 'Evenements', icon: Calendar, roles: ['ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/calendrier', label: 'Calendrier', icon: CalendarClock, roles: ['ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/reunions', label: 'Reunions', icon: Briefcase, roles: ['ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'] },
  { href: '/dashboard/documents', label: 'Documents', icon: FolderOpen, roles: ['ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'] },
  { href: '/dashboard/materiel', label: 'Materiel', icon: Box, roles: ['ADMIN', 'DIRECTEUR'] },
  { href: '/dashboard/demandes-materiel', label: 'Demandes materiel', icon: ClipboardList, roles: ['ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/conventions', label: 'Conventions', icon: Handshake, roles: ['ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'] },
  { href: '/dashboard/discussions', label: 'Discussions', icon: MessageSquare, roles: ['ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'] },
  { href: '/dashboard/demandes-adhesion', label: 'Adhesions', icon: ClipboardCheck, roles: ['ADMIN', 'DIRECTEUR'] },
  { href: '/dashboard/mandats', label: 'Mandats', icon: Shield, roles: ['ADMIN'] },
  { href: '/dashboard/rapport-annuel', label: 'Rapport annuel', icon: FileText, roles: ['ADMIN', 'DIRECTEUR'] },
  { href: '/dashboard/statistiques', label: 'Statistiques', icon: BarChart3, roles: ['ADMIN', 'DIRECTEUR'] },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, roles: ['ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE', 'VICE_DIRECTEUR'] },
];

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { role } = useAuthStore();

  const filteredItems = menuItems.filter(item => item.roles.includes(role || RoleSysteme.MEMBRE));

  return (
    <aside className={cn(
      'bg-primary text-white h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="p-4 flex items-center justify-between border-b border-blue-800">
        {!collapsed && <span className="font-heading font-bold text-lg">LIAS</span>}
        <button onClick={onToggle} className="p-1 hover:bg-blue-800 rounded" title={collapsed ? 'Ouvrir le menu' : 'Fermer le menu'}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                isActive ? 'bg-blue-800 text-white border-r-2 border-accent' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
