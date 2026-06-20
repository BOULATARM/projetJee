'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { RoleSysteme, StatutMembre } from '@/types';
import { X } from 'lucide-react';
import {
  LayoutDashboard, Users, BookOpen, Calendar, FolderOpen, Box, Handshake,
  MessageCircle, Bell, BarChart3, FileText, ClipboardCheck, Shield, Briefcase,
  ChevronLeft, ChevronRight, GraduationCap, CalendarClock, ClipboardList, Search, ScrollText, Building2,
} from 'lucide-react';

type MenuItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
  statuts?: string[];
};

const allMenuItems: MenuItem[] = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/retraite', label: 'Mon espace', icon: LayoutDashboard, roles: ['MEMBRE'], statuts: ['RETRAITE'] },
  { href: '/dashboard/ancien',  label: 'Mon espace', icon: LayoutDashboard, roles: ['MEMBRE'], statuts: ['ANCIEN'] },
  { href: '/dashboard/associe',   label: 'Mon espace', icon: LayoutDashboard, roles: ['MEMBRE'], statuts: ['ASSOCIE'] },
  { href: '/dashboard/doctorant', label: 'Mon espace', icon: LayoutDashboard, roles: ['MEMBRE'], statuts: ['DOCTORANT'] },
  { href: '/dashboard/profil', label: 'Mon profil', icon: Users, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/recherche', label: 'Recherche', icon: Search, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/membres', label: 'Membres', icon: Users, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE'] },
  { href: '/dashboard/equipes', label: 'Équipes', icon: GraduationCap, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'] },
  { href: '/dashboard/publications', label: 'Publications', icon: BookOpen, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/evenements', label: 'Événements', icon: Calendar, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/calendrier', label: 'Calendrier', icon: CalendarClock, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/reunions', label: 'Réunions', icon: Briefcase, roles: ['DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT'] },
  { href: '/dashboard/documents', label: 'Documents', icon: FolderOpen, roles: ['DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT'] },
  { href: '/dashboard/mes-documents', label: 'Mes documents', icon: FolderOpen, roles: ['MEMBRE'], statuts: ['DOCTORANT', 'ASSOCIE', 'PERMANENT'] },
  { href: '/dashboard/conventions', label: 'Conventions', icon: Handshake, roles: ['DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT'] },
  { href: '/dashboard/messages', label: 'Messagerie', icon: MessageCircle, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'] },
  { href: '/dashboard/demandes-materiel', label: 'Demandes matériel', icon: ClipboardList, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT'] },
  { href: '/dashboard/laboratoire', label: 'Laboratoire', icon: Building2, roles: ['DIRECTEUR'] },
  { href: '/dashboard/documents-approbation', label: 'Approbation documents', icon: ClipboardCheck, roles: ['DIRECTEUR'] },
  { href: '/dashboard/materiel', label: 'Matériel', icon: Box, roles: ['ADMIN', 'DIRECTEUR'] },
  { href: '/dashboard/demandes-adhesion', label: 'Adhésions', icon: ClipboardCheck, roles: ['DIRECTEUR'] },
  { href: '/dashboard/rapport-annuel', label: 'Rapport annuel', icon: FileText, roles: ['DIRECTEUR'] },
  { href: '/dashboard/statistiques', label: 'Statistiques', icon: BarChart3, roles: ['DIRECTEUR', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/admin/comptes', label: 'Comptes', icon: Users, roles: ['ADMIN'] },
  { href: '/dashboard/mandats', label: 'Mandats', icon: Shield, roles: ['ADMIN'] },
  { href: '/dashboard/audit-logs', label: 'Journal d\'audit', icon: ScrollText, roles: ['ADMIN'] },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
];

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

function NavContent({
  collapsed,
  onToggle,
  onLinkClick,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const { role, statut } = useAuthStore();

  const isAdmin =
    role === RoleSysteme.ADMIN ||
    role === RoleSysteme.DIRECTEUR ||
    role === RoleSysteme.VICE_DIRECTEUR ||
    role === RoleSysteme.CHEF_EQUIPE;

  const filteredItems = allMenuItems.filter(item => {
    if (!item.roles.includes(role || 'MEMBRE')) return false;
    if (isAdmin) return true;
    if (item.statuts && statut) return item.statuts.includes(statut);
    return true;
  });

  return (
    <>
      {/* Logo / toggle */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-white">LIAS</span>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors ml-auto"
            aria-label="Réduire le menu"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* Statut badge */}
      {!collapsed && statut && (
        <div className="shrink-0 border-b border-white/10 px-4 py-2">
          <span className={cn(
            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
            statut === StatutMembre.PERMANENT  ? 'bg-teal-600 text-white'   :
            statut === StatutMembre.ASSOCIE    ? 'bg-purple-600 text-white' :
            statut === StatutMembre.DOCTORANT  ? 'bg-sky-600 text-white'    :
            statut === StatutMembre.RETRAITE   ? 'bg-orange-500 text-white' :
            statut === StatutMembre.ANCIEN     ? 'bg-rose-600 text-white'   :
            'bg-white/20 text-white'
          )}>
            {statut}
          </span>
        </div>
      )}

      {/* Nav links — scrollable sans scrollbar visible */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {filteredItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              title={collapsed ? item.label : undefined}
              className={cn(
                'group flex items-center gap-3 px-3 mx-2 py-2.5 rounded-lg text-sm transition-all duration-150',
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/65 hover:bg-white/10 hover:text-white',
              )}
            >
              <item.icon
                size={18}
                className={cn('shrink-0 transition-transform group-hover:scale-105', isActive && 'text-white')}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && isActive && (
                <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary-300" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* ── Desktop sidebar (caché sur mobile) ── */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen',
          'bg-primary-800 text-white shrink-0',
          'transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <NavContent collapsed={collapsed} onToggle={onToggle} />
      </aside>

      {/* ── Mobile : backdrop + drawer (visible uniquement sur mobile) ── */}
      {mobileOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-primary-800 text-white animate-slide-in-left">
            {/* Bouton fermer */}
            <button
              onClick={onCloseMobile}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Fermer le menu"
            >
              <X size={18} />
            </button>
            <NavContent collapsed={false} onLinkClick={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}
