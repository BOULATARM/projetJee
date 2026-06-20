'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { RoleSysteme, StatutMembre } from '@/types';
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
  statuts?: string[]; // si défini, seuls ces statuts voient l'item
};

const allMenuItems: MenuItem[] = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/retraite', label: 'Mon espace', icon: LayoutDashboard, roles: ['MEMBRE'], statuts: ['RETRAITE'] },
  { href: '/dashboard/ancien',  label: 'Mon espace', icon: LayoutDashboard, roles: ['MEMBRE'], statuts: ['ANCIEN'] },
  { href: '/dashboard/associe',   label: 'Mon espace', icon: LayoutDashboard, roles: ['MEMBRE'], statuts: ['ASSOCIE'] },
  { href: '/dashboard/doctorant', label: 'Mon espace', icon: LayoutDashboard, roles: ['MEMBRE'], statuts: ['DOCTORANT'] },
  { href: '/dashboard/profil', label: 'Mon profil', icon: Users, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/recherche', label: 'Recherche', icon: Search, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },

  // Membres
  { href: '/dashboard/membres', label: 'Membres', icon: Users, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE'] },

  // Équipes — DIRECTEUR uniquement (ADMIN n'y a pas accès)
  { href: '/dashboard/equipes', label: 'Équipes', icon: GraduationCap, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'] },

  // Publications
  { href: '/dashboard/publications', label: 'Publications', icon: BookOpen, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },

  // Événements
  { href: '/dashboard/evenements', label: 'Événements', icon: Calendar, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
  { href: '/dashboard/calendrier', label: 'Calendrier', icon: CalendarClock, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },

  // Modules internes — permanents uniquement
  { href: '/dashboard/reunions', label: 'Réunions', icon: Briefcase, roles: ['DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT'] },
  { href: '/dashboard/documents', label: 'Documents', icon: FolderOpen, roles: ['DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT'] },
  { href: '/dashboard/mes-documents', label: 'Mes documents', icon: FolderOpen, roles: ['MEMBRE'], statuts: ['DOCTORANT', 'ASSOCIE', 'PERMANENT'] },
  { href: '/dashboard/conventions', label: 'Conventions', icon: Handshake, roles: ['DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT'] },
  { href: '/dashboard/messages', label: 'Messagerie', icon: MessageCircle, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'] },
  { href: '/dashboard/demandes-materiel', label: 'Demandes matériel', icon: ClipboardList, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT'] },

  // Admin/Directeur seulement

  { href: '/dashboard/laboratoire', label: 'Laboratoire', icon: Building2, roles: ['DIRECTEUR'] },
  { href: '/dashboard/documents-approbation', label: 'Approbation documents', icon: ClipboardCheck, roles: ['DIRECTEUR'] },
  { href: '/dashboard/materiel', label: 'Matériel', icon: Box, roles: ['ADMIN', 'DIRECTEUR'] },
  { href: '/dashboard/demandes-adhesion', label: 'Adhésions', icon: ClipboardCheck, roles: ['DIRECTEUR'] },
  { href: '/dashboard/rapport-annuel', label: 'Rapport annuel', icon: FileText, roles: ['DIRECTEUR'] },
  { href: '/dashboard/statistiques', label: 'Statistiques', icon: BarChart3, roles: ['DIRECTEUR', 'VICE_DIRECTEUR'] },
  { href: '/dashboard/admin/comptes', label: 'Comptes', icon: Users, roles: ['ADMIN'] },
  { href: '/dashboard/mandats', label: 'Mandats', icon: Shield, roles: ['ADMIN'] },
  { href: '/dashboard/audit-logs', label: 'Journal d\'audit', icon: ScrollText, roles: ['ADMIN'] },

  // Notifications
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, roles: ['ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE', 'MEMBRE'], statuts: ['PERMANENT', 'ASSOCIE', 'DOCTORANT'] },
];

type SidebarProps = { collapsed: boolean; onToggle: () => void };

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { role, statut } = useAuthStore();

  const isAdmin = role === RoleSysteme.ADMIN || role === RoleSysteme.DIRECTEUR || role === RoleSysteme.VICE_DIRECTEUR || role === RoleSysteme.CHEF_EQUIPE;
  // DIRECTEUR has no statut filter — they only see items in their roles list

  const filteredItems = allMenuItems.filter(item => {
    if (!item.roles.includes(role || 'MEMBRE')) return false;
    // Les admins/directeurs voient tout
    if (isAdmin) return true;
    // Pour les membres, vérifier aussi le statut
    if (item.statuts && statut) {
      return item.statuts.includes(statut);
    }
    // Pas de restriction de statut → visible pour tous
    return true;
  });

  return (
    <aside className={cn(
      'bg-primary text-white h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="p-4 flex items-center justify-between border-b border-blue-800">
        {!collapsed && <span className="font-heading font-bold text-lg">LIAS</span>}
        <button onClick={onToggle} className="p-1 hover:bg-blue-800 rounded">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {!collapsed && statut && (
        <div className="px-4 py-2 border-b border-blue-800">
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            statut === StatutMembre.PERMANENT ? 'bg-blue-600 text-white' :
            statut === StatutMembre.ASSOCIE ? 'bg-purple-600 text-white' :
            statut === StatutMembre.DOCTORANT ? 'bg-green-600 text-white' :
            statut === StatutMembre.RETRAITE ? 'bg-orange-500 text-white' :
            statut === StatutMembre.ANCIEN ? 'bg-red-600 text-white' :
            'bg-gray-600 text-white'
          )}>
            {statut}
          </span>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
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
