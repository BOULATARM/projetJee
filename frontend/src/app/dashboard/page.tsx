'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { getStatutColor, formatDate } from '@/lib/utils';
import { statsService } from '@/services/stats.service';
import { evenementService } from '@/services/evenement.service';
import { publicationService } from '@/services/publication.service';
import { membreService } from '@/services/membre.service';
import { DashboardStats, EvenementResponse, PublicationResponse, RoleSysteme, StatutMembre, MembreDetail } from '@/types';
import { Users, BookOpen, Calendar, GraduationCap, ArrowRight, Shield, FileText, ClipboardCheck, Briefcase, Bell } from 'lucide-react';
import api from '@/lib/api';
import { toArray } from '@/lib/normalize';

// ─── Dashboard ADMIN / DIRECTEUR ───────────────────────────────────────────
function DashboardAdmin({ stats, evenements, publications }: {
  stats: DashboardStats | null;
  evenements: EvenementResponse[];
  publications: PublicationResponse[];
}) {
  const [pendingCount, setPendingCount] = useState(0);
  useEffect(() => {
    api.get('/demandes-adhesion').then(r => {
      const list = toArray(r.data);
      setPendingCount((list as Array<{ statut: string }>).filter(d => d.statut === 'PENDING').length);
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Membres actifs', value: stats?.nbMembres || 0, icon: Users, color: 'bg-blue-500', href: '/dashboard/membres' },
    { label: 'Publications', value: stats?.nbPublications || 0, icon: BookOpen, color: 'bg-green-500', href: '/dashboard/publications' },
    { label: 'Événements', value: stats?.nbEvenements || 0, icon: Calendar, color: 'bg-purple-500', href: '/dashboard/evenements' },
    { label: 'Équipes', value: stats?.nbEquipes || 0, icon: GraduationCap, color: 'bg-orange-500', href: '/dashboard/equipes' },
    { label: 'Doctorants', value: stats?.nbDoctorants || 0, icon: GraduationCap, color: 'bg-teal-500', href: '/dashboard/membres' },
    { label: 'Conventions actives', value: stats?.nbConventionsActives || 0, icon: FileText, color: 'bg-indigo-500', href: '/dashboard/conventions' },
    { label: 'Adhésions en attente', value: pendingCount, icon: ClipboardCheck, color: pendingCount > 0 ? 'bg-red-500' : 'bg-gray-400', href: '/dashboard/demandes-adhesion' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <Link key={c.label} href={c.href}>
            <Card className="flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`${c.color} p-3 rounded-lg shrink-0`}><c.icon size={22} className="text-white" /></div>
              <div><p className="text-xl font-bold text-gray-800">{c.value}</p><p className="text-xs text-gray-500">{c.label}</p></div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold">Prochains événements</h2>
            <Link href="/dashboard/evenements" className="text-primary text-sm flex items-center gap-1">Voir tout <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-2">
            {evenements.filter(e => e.statut === 'PLANIFIE').slice(0, 5).map(e => (
              <div key={e.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div><p className="font-medium text-sm">{e.titre}</p><p className="text-xs text-gray-500">{formatDate(e.dateDebut)}</p></div>
                <Badge className={getStatutColor(e.statut)}>{e.statut}</Badge>
              </div>
            ))}
            {evenements.filter(e => e.statut === 'PLANIFIE').length === 0 && <p className="text-sm text-gray-400">Aucun événement planifié</p>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold">Dernières publications</h2>
            <Link href="/dashboard/publications" className="text-primary text-sm flex items-center gap-1">Voir tout <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-2">
            {publications.slice(0, 5).map(p => (
              <div key={p.id} className="p-2 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{p.titre}</p>
                <div className="flex gap-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-800 text-xs">{p.typePub}</Badge>
                  <span className="text-xs text-gray-500">{p.annee}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Dashboard VICE_DIRECTEUR / CHEF_EQUIPE ─────────────────────────────────
function DashboardChef({ stats, evenements, publications }: {
  stats: DashboardStats | null;
  evenements: EvenementResponse[];
  publications: PublicationResponse[];
}) {
  const { role } = useAuthStore();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Membres', value: stats?.nbMembres || 0, icon: Users, color: 'bg-blue-500' },
          { label: 'Publications', value: stats?.nbPublications || 0, icon: BookOpen, color: 'bg-green-500' },
          { label: 'Événements', value: stats?.nbEvenements || 0, icon: Calendar, color: 'bg-purple-500' },
        ].map(c => (
          <Card key={c.label} className="flex items-center gap-3">
            <div className={`${c.color} p-3 rounded-lg`}><c.icon size={22} className="text-white" /></div>
            <div><p className="text-xl font-bold">{c.value}</p><p className="text-xs text-gray-500">{c.label}</p></div>
          </Card>
        ))}
      </div>

      {role === RoleSysteme.VICE_DIRECTEUR && (
        <Card className="border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-blue-500" />
            <div>
              <p className="font-semibold text-gray-800">Vice-Directeur</p>
              <p className="text-sm text-gray-500">Accès supervision : statistiques, membres, publications, équipes, événements</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-heading font-semibold mb-3">Prochains événements</h2>
          <div className="space-y-2">
            {evenements.filter(e => e.statut === 'PLANIFIE').slice(0, 4).map(e => (
              <div key={e.id} className="flex justify-between p-2 bg-gray-50 rounded">
                <div><p className="text-sm font-medium">{e.titre}</p><p className="text-xs text-gray-500">{formatDate(e.dateDebut)}</p></div>
                <Badge className={getStatutColor(e.statut)}>{e.statut}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-heading font-semibold mb-3">Publications récentes</h2>
          <div className="space-y-2">
            {publications.slice(0, 4).map(p => (
              <div key={p.id} className="p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium">{p.titre}</p>
                <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">{p.typePub}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Dashboard MEMBRE PERMANENT ─────────────────────────────────────────────
function DashboardPermanent({ evenements, publications, profil }: {
  evenements: EvenementResponse[];
  publications: PublicationResponse[];
  profil: MembreDetail | null;
}) {
  const myPubs = publications.filter(p => p.auteurs?.some(a => a.id === profil?.id));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3">
          <div className="bg-green-500 p-3 rounded-lg"><BookOpen size={22} className="text-white" /></div>
          <div><p className="text-xl font-bold">{profil?.publications?.length || 0}</p><p className="text-xs text-gray-500">Mes publications</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="bg-purple-500 p-3 rounded-lg"><Calendar size={22} className="text-white" /></div>
          <div><p className="text-xl font-bold">{evenements.length}</p><p className="text-xs text-gray-500">Événements</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="bg-blue-500 p-3 rounded-lg"><Briefcase size={22} className="text-white" /></div>
          <div><p className="text-xl font-bold">{profil?.affiliations?.filter(a => a.actif).length || 0}</p><p className="text-xs text-gray-500">Équipe(s) actives</p></div>
        </Card>
      </div>

      {profil?.affiliations?.some(a => a.actif) && (
        <Card className="border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-700">Équipe actuelle :</p>
          {profil.affiliations.filter(a => a.actif).map(a => (
            <p key={a.id} className="font-semibold text-primary">{a.equipeNom}</p>
          ))}
          <p className="text-xs text-gray-400 mt-1">Depuis le {formatDate(profil.affiliations.find(a => a.actif)?.dateDebut || '')}</p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between mb-3">
            <h2 className="font-heading font-semibold">Mes publications</h2>
            <Link href="/dashboard/publications" className="text-primary text-sm flex items-center gap-1">Voir tout <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-2">
            {(myPubs.length > 0 ? myPubs : publications).slice(0, 4).map(p => (
              <div key={p.id} className="p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium">{p.titre}</p>
                <div className="flex gap-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-800 text-xs">{p.typePub}</Badge>
                  <span className="text-xs text-gray-500">{p.annee}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex justify-between mb-3">
            <h2 className="font-heading font-semibold">Prochains événements</h2>
            <Link href="/dashboard/evenements" className="text-primary text-sm flex items-center gap-1">Voir tout <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-2">
            {evenements.filter(e => e.statut === 'PLANIFIE').slice(0, 4).map(e => (
              <div key={e.id} className="flex justify-between p-2 bg-gray-50 rounded">
                <div><p className="text-sm font-medium">{e.titre}</p><p className="text-xs text-gray-500">{formatDate(e.dateDebut)}</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Dashboard MEMBRE ASSOCIÉ ────────────────────────────────────────────────
function DashboardAssocie({ evenements, publications }: {
  evenements: EvenementResponse[];
  publications: PublicationResponse[];
}) {
  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-purple-500 bg-purple-50">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-purple-600" />
          <div>
            <p className="font-semibold text-gray-800">Membre Associé</p>
            <p className="text-sm text-gray-600">Accès : consultation, événements, publications selon droits accordés</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex items-center gap-3">
          <div className="bg-green-500 p-3 rounded-lg"><BookOpen size={22} className="text-white" /></div>
          <div><p className="text-xl font-bold">{publications.length}</p><p className="text-xs text-gray-500">Publications disponibles</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="bg-purple-500 p-3 rounded-lg"><Calendar size={22} className="text-white" /></div>
          <div><p className="text-xl font-bold">{evenements.length}</p><p className="text-xs text-gray-500">Événements</p></div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between mb-3">
            <h2 className="font-heading font-semibold">Publications récentes</h2>
            <Link href="/dashboard/publications" className="text-primary text-sm flex items-center gap-1">Voir tout <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-2">
            {publications.slice(0, 5).map(p => (
              <div key={p.id} className="p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium">{p.titre}</p>
                <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">{p.typePub}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex justify-between mb-3">
            <h2 className="font-heading font-semibold">Événements</h2>
            <Link href="/dashboard/evenements" className="text-primary text-sm flex items-center gap-1">Voir tout <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-2">
            {evenements.slice(0, 5).map(e => (
              <div key={e.id} className="p-2 bg-gray-50 rounded flex justify-between">
                <div><p className="text-sm font-medium">{e.titre}</p><p className="text-xs text-gray-500">{formatDate(e.dateDebut)}</p></div>
                <Badge className={getStatutColor(e.statut)}>{e.statut}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Dashboard DOCTORANT ─────────────────────────────────────────────────────
function DashboardDoctorant({ publications, profil }: {
  publications: PublicationResponse[];
  profil: MembreDetail | null;
}) {
  const myPubs = publications.filter(p => p.auteurs?.some(a => a.id === profil?.id));
  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-green-500 bg-green-50">
        <div className="flex items-center gap-3">
          <GraduationCap size={20} className="text-green-600" />
          <div>
            <p className="font-semibold text-gray-800">Doctorant</p>
            <p className="text-sm text-gray-600">Accès : ajouter et consulter des publications · Mon profil</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex items-center gap-3">
          <div className="bg-green-500 p-3 rounded-lg"><BookOpen size={22} className="text-white" /></div>
          <div><p className="text-xl font-bold">{myPubs.length}</p><p className="text-xs text-gray-500">Mes publications</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="bg-blue-500 p-3 rounded-lg"><GraduationCap size={22} className="text-white" /></div>
          <div><p className="text-xl font-bold">{profil?.affiliations?.filter(a => a.actif).length || 0}</p><p className="text-xs text-gray-500">Équipe(s)</p></div>
        </Card>
      </div>

      {profil?.affiliations?.some(a => a.actif) && (
        <Card className="border-l-4 border-green-400">
          <p className="text-sm text-gray-500">Équipe de recherche :</p>
          <p className="font-semibold text-primary text-lg">{profil.affiliations.find(a => a.actif)?.equipeNom}</p>
          <p className="text-xs text-gray-400">Depuis {formatDate(profil.affiliations.find(a => a.actif)?.dateDebut || '')}</p>
        </Card>
      )}

      <Card>
        <div className="flex justify-between mb-3">
          <h2 className="font-heading font-semibold">Mes publications</h2>
          <Link href="/dashboard/publications" className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
            <BookOpen size={14} /> Ajouter
          </Link>
        </div>
        {myPubs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Aucune publication pour l&apos;instant</p>
        ) : (
          <div className="space-y-2">
            {myPubs.slice(0, 6).map(p => (
              <div key={p.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{p.titre}</p>
                <div className="flex gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">{p.typePub}</Badge>
                  <span className="text-xs text-gray-500">{p.annee}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { role, statut, membreId, nom, prenom } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [evenements, setEvenements] = useState<EvenementResponse[]>([]);
  const [publications, setPublications] = useState<PublicationResponse[]>([]);
  const [profil, setProfil] = useState<MembreDetail | null>(null);

  useEffect(() => {
    evenementService.getAll().then(setEvenements).catch(() => {});
    publicationService.getAll().then(setPublications).catch(() => {});
    if (membreId) {
      membreService.getById(membreId).then(setProfil).catch(() => {});
    }
    if (role === RoleSysteme.ADMIN || role === RoleSysteme.DIRECTEUR || role === RoleSysteme.VICE_DIRECTEUR) {
      statsService.getDashboard().then(setStats).catch(() => {});
    }
  }, [role, membreId]);

  const greeting = `Bonjour, ${prenom} ${nom}`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">{greeting}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {role === RoleSysteme.ADMIN && 'Administrateur système'}
            {role === RoleSysteme.DIRECTEUR && 'Directeur du laboratoire'}
            {role === RoleSysteme.VICE_DIRECTEUR && 'Vice-Directeur'}
            {role === RoleSysteme.CHEF_EQUIPE && 'Chef d\'équipe'}
            {role === RoleSysteme.MEMBRE && statut === StatutMembre.PERMANENT && 'Membre permanent'}
            {role === RoleSysteme.MEMBRE && statut === StatutMembre.ASSOCIE && 'Membre associé'}
            {role === RoleSysteme.MEMBRE && statut === StatutMembre.DOCTORANT && 'Doctorant'}
          </p>
        </div>
        <Link href="/dashboard/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell size={22} className="text-gray-600" />
        </Link>
      </div>

      {(role === RoleSysteme.ADMIN || role === RoleSysteme.DIRECTEUR) && (
        <DashboardAdmin stats={stats} evenements={evenements} publications={publications} />
      )}
      {role === RoleSysteme.VICE_DIRECTEUR && (
        <DashboardChef stats={stats} evenements={evenements} publications={publications} />
      )}
      {role === RoleSysteme.CHEF_EQUIPE && (
        <DashboardChef stats={stats} evenements={evenements} publications={publications} />
      )}
      {role === RoleSysteme.MEMBRE && statut === StatutMembre.PERMANENT && (
        <DashboardPermanent evenements={evenements} publications={publications} profil={profil} />
      )}
      {role === RoleSysteme.MEMBRE && statut === StatutMembre.ASSOCIE && (
        <DashboardAssocie evenements={evenements} publications={publications} />
      )}
      {role === RoleSysteme.MEMBRE && statut === StatutMembre.DOCTORANT && (
        <DashboardDoctorant publications={publications} profil={profil} />
      )}
    </div>
  );
}
