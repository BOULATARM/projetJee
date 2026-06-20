'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor } from '@/lib/utils';
import { membreService } from '@/services/membre.service';
import { MembreResponse } from '@/types';
import { Search, UserPlus, Shield, Users, Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import { RoleSysteme } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function MembresPage() {
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [search, setSearch] = useState('');
  const { role } = useAuthStore();
  const isAdminOnly = role === RoleSysteme.ADMIN;

  useEffect(() => {
    membreService.getAll().then(setMembres).catch(() => {});
  }, []);

  const actifs = membres.filter(m =>
    m.active !== false &&
    m.statut !== 'RETRAITE' &&
    m.statut !== 'ANCIEN'
  );

  const filtered = search
    ? actifs.filter(m => `${m.nom} ${m.prenom}`.toLowerCase().includes(search.toLowerCase()) || m.email.includes(search))
    : actifs;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Membres</h1>
        {!isAdminOnly && (
          <div className="flex gap-2">
            <Link href="/dashboard/membres/new" className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
              <UserPlus size={18} /> Nouveau membre
            </Link>
          </div>
        )}
      </div>

      <div className="relative mb-6">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un membre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => {
          const roleLabel =
            m.roleActuel === 'DIRECTEUR'     ? { label: 'Directeur',       cls: 'bg-blue-700 text-white',   icon: <Shield size={11} /> } :
            m.roleActuel === 'VICE_DIRECTEUR'? { label: 'Vice-Directeur',  cls: 'bg-indigo-600 text-white', icon: <Shield size={11} /> } :
            m.roleActuel === 'CHEF_EQUIPE'   ? { label: 'Chef d\'équipe',  cls: 'bg-teal-600 text-white',   icon: <Star size={11} /> } :
            null;

          return (
            <Link key={m.id} href={`/dashboard/membres/${m.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <Avatar photo={m.photo} nom={m.nom} prenom={m.prenom} size={48} />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{m.prenom} {m.nom}</p>
                    <p className="text-sm text-gray-500">{m.email}</p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
                      <Badge className={getStatutColor(m.statut)}>{m.statut}</Badge>
                      {roleLabel && (
                        <Badge className={`flex items-center gap-1 ${roleLabel.cls}`}>
                          {roleLabel.icon} {roleLabel.label}
                          {m.roleActuel === 'CHEF_EQUIPE' && m.equipeActuelle && (
                            <span className="opacity-80">— {m.equipeActuelle}</span>
                          )}
                        </Badge>
                      )}
                      {m.equipeActuelle && m.roleActuel !== 'CHEF_EQUIPE' && (
                        <Badge className="bg-gray-100 text-gray-600 flex items-center gap-1">
                          <Users size={10} /> {m.equipeActuelle}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
