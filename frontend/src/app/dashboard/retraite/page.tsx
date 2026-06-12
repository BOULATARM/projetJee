'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor } from '@/lib/utils';
import { User, BookOpen, Mail, Briefcase } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface Profil {
  id: number; nom: string; prenom: string; email: string; statut: string;
  biographie?: string; etablissementOrigine?: string; dateEmbauche?: string;
}
interface Publication {
  id: number; titre: string; annee: number; typePub: string;
  auteurs?: { nom: string; prenom: string }[];
}

const TYPE_PUB_COLORS: Record<string, string> = {
  ARTICLE: 'bg-blue-100 text-blue-700', CONFERENCE: 'bg-purple-100 text-purple-700',
  THESE: 'bg-green-100 text-green-700', RAPPORT: 'bg-orange-100 text-orange-700',
};

const TABS = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'publications', label: 'Publications', icon: BookOpen },
] as const;
type TabId = typeof TABS[number]['id'];

export default function RetraiteDashboard() {
  const { membreId, nom, prenom, statut } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('profil');
  const [profil, setProfil] = useState<Profil | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!membreId) return;
    setLoading(true);
    if (activeTab === 'profil') {
      api.get(`/membres/${membreId}`).then(r => setProfil(r.data)).catch(() => {}).finally(() => setLoading(false));
    } else {
      api.get('/publications').then(r => {
        const all: Publication[] = Array.isArray(r.data) ? r.data : Object.values(r.data);
        setPublications(all.filter(p => p.auteurs?.some(a => a.nom === nom && a.prenom === prenom)));
      }).catch(() => {}).finally(() => setLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, membreId]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">Bonjour, {prenom} {nom}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Espace membre retraité — consultation uniquement</p>
        </div>
        {statut && <Badge className={getStatutColor(statut)}>{statut}</Badge>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-primary text-primary bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                <Icon size={16} />{tab.label}
                {tab.id === 'publications' && publications.length > 0 && (
                  <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">{publications.length}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {loading && <div className="py-12 text-center text-gray-400">Chargement…</div>}

          {!loading && activeTab === 'profil' && profil && (
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center gap-5">
                <Avatar photo={profil.photo} nom={profil.nom} prenom={profil.prenom} size={80} />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{profil.prenom} {profil.nom}</h2>
                  <Badge className={getStatutColor(profil.statut)}>{profil.statut}</Badge>
                </div>
              </div>
              <Card>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600"><Mail size={15} className="text-gray-400" />{profil.email}</div>
                  {profil.etablissementOrigine && <div className="flex items-center gap-2 text-gray-600">📍 {profil.etablissementOrigine}</div>}
                  {profil.dateEmbauche && <div className="flex items-center gap-2 text-gray-600"><Briefcase size={15} className="text-gray-400" />Depuis {new Date(profil.dateEmbauche).toLocaleDateString('fr-FR')}</div>}
                </div>
              </Card>
              {profil.biographie && <Card><p className="text-sm font-medium text-gray-700 mb-1">Biographie</p><p className="text-sm text-gray-500">{profil.biographie}</p></Card>}
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg text-sm text-orange-700">
                🔒 Espace consultation uniquement. Les modifications ne sont pas disponibles.
              </div>
            </div>
          )}

          {!loading && activeTab === 'publications' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-2">{publications.length} publication{publications.length !== 1 ? 's' : ''}</p>
              {publications.length === 0 ? (
                <div className="text-center py-12"><BookOpen size={40} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-400">Aucune publication.</p></div>
              ) : publications.map(p => (
                <Card key={p.id} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{p.titre}</p>
                    {p.auteurs && <p className="text-xs text-gray-400 mt-1">{p.auteurs.map(a => `${a.prenom} ${a.nom}`).join(', ')}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge className={TYPE_PUB_COLORS[p.typePub] || 'bg-gray-100 text-gray-600'}>{p.typePub}</Badge>
                    <span className="text-xs text-gray-400">{p.annee}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}