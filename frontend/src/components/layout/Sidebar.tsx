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
import { useT } from '@/hooks/useT';
type MenuItem = {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  roles: string[];
  statuts?: string[];
};

const allMenuItems: MenuItem[] = [
  { href: '/dashboard',                      labelKey: 'dashboard',     icon: LayoutDashboard, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/retraite',             labelKey: 'mySpace',       icon: LayoutDashboard, roles: ['MEMBRE'], statuts: ['RETRAITE'] },
  { href: '/dashboard/ancien',               labelKey: 'mySpace',       icon: LayoutDashboard, roles: ['MEMBRE'], statuts: ['ANCIEN'] },
  { href: '/dashboard/associe',              labelKey: 'mySpace',       icon: LayoutDashboard, roles: ['MEMBRE'], statuts: ['ASSOCIE'] },
  { href: '/dashboard/doctorant',            labelKey: 'mySpace',       icon: LayoutDashboard, roles: ['MEMBRE'], statuts: ['DOCTORANT'] },
  { href: '/dashboard/profil',               labelKey: 'profile',       icon: Users,           roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/recherche',            labelKey: 'search',        icon: Search,          roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/membres',              labelKey: 'members',       icon: Users,           roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE'] },
  { href: '/dashboard/equipes',              labelKey: 'teams',         icon: GraduationCap,   roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'] },
  { href: '/dashboard/publications',         labelKey: 'publications',  icon: BookOpen,        roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/evenements',           labelKey: 'events',        icon: Calendar,        roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/calendrier',           labelKey: 'calendar',      icon: CalendarClock,   roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/reunions',             labelKey: 'meetings',      icon: Briefcase,       roles: ['DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT'] },
  { href: '/dashboard/documents',            labelKey: 'documents',     icon: FolderOpen,      roles: ['DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT'] },
  { href: '/dashboard/mes-documents',        labelKey: 'myDocuments',   icon: FolderOpen,      roles: ['MEMBRE'], statuts: ['DOCTORANT', 'ASSOCIE', 'PERMANENT'] },
  { href: '/dashboard/conventions',          labelKey: 'conventions',   icon: Handshake,       roles: ['DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT'] },
  { href: '/dashboard/messages',             labelKey: 'messaging',     icon: MessageCircle,   roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'] },
  { href: '/dashboard/demandes-materiel',    labelKey: 'equipmentReqs', icon: ClipboardList,   roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT'] },
  { href: '/dashboard/laboratoire',          labelKey: 'laboratory',    icon: Building2,       roles: ['DIRECTEUR', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/documents-approbation',labelKey: 'docApproval',   icon: ClipboardCheck,  roles: ['DIRECTEUR', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/materiel',             labelKey: 'equipment',     icon: Box,             roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/demandes-adhesion',    labelKey: 'memberships',   icon: ClipboardCheck,  roles: ['DIRECTEUR', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/rapport-annuel',       labelKey: 'annualReport',  icon: FileText,        roles: ['DIRECTEUR', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/statistiques',         labelKey: 'statistics',    icon: BarChart3,       roles: ['DIRECTEUR', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/admin/comptes',        labelKey: 'accounts',      icon: Users,           roles: ['ADMIN'] },
  { href: '/dashboard/mandats',              labelKey: 'mandates',      icon: Shield,          roles: ['ADMIN'] },
  { href: '/dashboard/audit-logs',           labelKey: 'auditLog',      icon: ScrollText,      roles: ['ADMIN'] },
  { href: '/dashboard/notifications',        labelKey: 'notifications', icon: Bell,            roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
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
  const t = useT();

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
            aria-label={t.sidebar.collapse}
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

      {/* Nav links */}
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
              title={collapsed ? t.nav[item.labelKey] : undefined}
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
              {!collapsed && <span className="truncate">{t.nav[item.labelKey]}</span>}
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
  const t = useT();
  return (
    <>
      {/* Desktop sidebar */}
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

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-primary-800 text-white animate-slide-in-left">
            <button
              onClick={onCloseMobile}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label={t.sidebar.close}
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
