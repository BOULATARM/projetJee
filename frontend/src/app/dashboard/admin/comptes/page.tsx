'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import { toArray } from '@/lib/normalize';
import { Avatar } from '@/components/ui/Avatar';
import {
  Users, Search, ShieldCheck, ShieldOff, ChevronDown,
  RefreshCw, CheckCircle, XCircle, Tag, History, ChevronUp, UserCog,
} from 'lucide-react';

interface Compte {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  systemRole: string;
  statut: string;
  active: boolean;
  photo?: string;
  dateDesactivation: string | null;
  createdAt: string;
}

interface RoleOption { code: string; label: string }

interface AuditEntry {
  id: number;
  action: string;
  utilisateur: string;
  membreId: number;
  date: string;
  details: string;
}

const ACTION_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DESACTIVATION_COMPTE: { label: 'Désactivation',    color: 'bg-red-100 text-red-700',    icon: <ShieldOff size={14} /> },
  REACTIVATION_COMPTE:  { label: 'Réactivation',     color: 'bg-green-100 text-green-700', icon: <ShieldCheck size={14} /> },
  CHANGEMENT_STATUT:    { label: 'Statut modifié',   color: 'bg-orange-100 text-orange-700', icon: <Tag size={14} /> },
  CHANGEMENT_ROLE:      { label: 'Rôle modifié',     color: 'bg-blue-100 text-blue-700',  icon: <UserCog size={14} /> },
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN:          'bg-red-100 text-red-800',
  DIRECTEUR:      'bg-purple-100 text-purple-800',
  VICE_DIRECTEUR: 'bg-indigo-100 text-indigo-800',
  CHEF_EQUIPE:    'bg-blue-100 text-blue-800',
  MEMBRE:         'bg-gray-100 text-gray-700',
};

const STATUT_COLORS: Record<string, string> = {
  PERMANENT: 'bg-blue-100 text-blue-700',
  ASSOCIE:   'bg-purple-100 text-purple-700',
  DOCTORANT: 'bg-green-100 text-green-700',
  RETRAITE:  'bg-orange-100 text-orange-700',
  ANCIEN:    'bg-red-100 text-red-700',
};

export default function AdminComptesPage() {
  const [comptes, setComptes]           = useState<Compte[]>([]);
  const [roles, setRoles]               = useState<RoleOption[]>([]);
  const [filterRole, setFilterRole]     = useState('');
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);

  // Historique
  const [historique, setHistorique]         = useState<AuditEntry[]>([]);
  const [histLoading, setHistLoading]       = useState(false);
  const [histFilter, setHistFilter]         = useState('');
  const [histActionFilter, setHistActionFilter] = useState('');
  const [histExpanded, setHistExpanded]     = useState(true);

  // Modal changement de statut
  const [modalStatut, setModalStatut]   = useState<Compte | null>(null);
  const [newStatut, setNewStatut]       = useState('');
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState('');

  const STATUTS_MEMBRE = [
    { code: 'PERMANENT', label: 'Membre permanent' },
    { code: 'ASSOCIE',   label: 'Membre associé' },
    { code: 'DOCTORANT', label: 'Doctorant' },
    { code: 'RETRAITE',  label: 'Retraité' },
    { code: 'ANCIEN',    label: 'Ancien membre' },
  ];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchHistorique = async () => {
    setHistLoading(true);
    try {
      const { data } = await api.get('/admin/comptes/historique');
      setHistorique(toArray(data));
    } catch {
      setHistorique([]);
    } finally {
      setHistLoading(false);
    }
  };

  const fetchComptes = async (role = filterRole) => {
    setLoading(true);
    try {
      const params = role ? `?role=${role}` : '';
      const { data } = await api.get(`/admin/comptes${params}`);
      setComptes(toArray(data));
    } catch {
      setComptes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/admin/comptes/roles-systeme')
      .then(r => setRoles(toArray(r.data)))
      .catch(() => setRoles([
        { code: 'ADMIN',          label: 'Administrateur' },
        { code: 'DIRECTEUR',      label: 'Directeur' },
        { code: 'VICE_DIRECTEUR', label: "Vice-Directeur" },
        { code: 'CHEF_EQUIPE',    label: "Chef d'équipe" },
        { code: 'MEMBRE',         label: 'Membre' },
      ]));
    fetchComptes('');
    fetchHistorique();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterRole = (r: string) => {
    setFilterRole(r);
    fetchComptes(r);
  };

  const toggleActivation = async (compte: Compte) => {
    const action = compte.active ? 'desactiver' : 'reactiver';
    const label  = compte.active ? 'Désactiver' : 'Réactiver';
    if (!confirm(`${label} le compte de ${compte.prenom} ${compte.nom} ?`)) return;
    try {
      const { data } = await api.put(`/admin/comptes/${compte.id}/${action}`);
      setComptes(prev => prev.map(c => c.id === compte.id ? { ...c, ...data } : c));
      showToast(`Compte ${compte.active ? 'désactivé' : 'réactivé'} avec succès.`);
      fetchHistorique();
    } catch {
      showToast('Erreur lors de la mise à jour.');
    }
  };

  const openModalStatut = (compte: Compte) => {
    setModalStatut(compte);
    setNewStatut(compte.statut);
  };

  const saveStatut = async () => {
    if (!modalStatut || newStatut === modalStatut.statut) { setModalStatut(null); return; }
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/comptes/${modalStatut.id}/statut`, { statut: newStatut });
      setComptes(prev => prev.map(c => c.id === modalStatut.id ? { ...c, ...data } : c));
      showToast('Statut mis à jour avec succès.');
      setModalStatut(null);
      fetchHistorique();
    } catch {
      showToast('Erreur lors du changement de statut.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = comptes.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.nom.toLowerCase().includes(q) ||
      c.prenom.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const stats = {
    total:   comptes.length,
    actifs:  comptes.filter(c => c.active).length,
    inactifs: comptes.filter(c => !c.active).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={28} className="text-primary" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-800">Gestion des comptes</h1>
            <p className="text-sm text-gray-500">Activez, désactivez ou modifiez les rôles des utilisateurs</p>
          </div>
        </div>
        <button
          onClick={() => fetchComptes(filterRole)}
          className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={15} /> Actualiser
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-primary">{stats.total}</p>
          <p className="text-sm text-gray-500 mt-1">Total comptes</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-green-600">{stats.actifs}</p>
          <p className="text-sm text-gray-500 mt-1">Actifs</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-red-500">{stats.inactifs}</p>
          <p className="text-sm text-gray-500 mt-1">Désactivés</p>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Filtre rôle */}
          <div className="relative">
            <select
              value={filterRole}
              onChange={e => handleFilterRole(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="">Tous les rôles</option>
              {roles.map(r => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Aucun compte trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rôle système</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut membre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Compte</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date désactivation</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(c => (
                  <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${!c.active ? 'opacity-60' : ''}`}>
                    {/* Avatar + nom */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar photo={c.photo} nom={c.nom} prenom={c.prenom} size={36} className="shrink-0" />
                        <span className="font-medium text-gray-800">{c.prenom} {c.nom}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-500">{c.email}</td>

                    {/* Rôle système */}
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[c.systemRole] || 'bg-gray-100 text-gray-600'}`}>
                        {c.systemRole}
                      </span>
                    </td>

                    {/* Statut membre */}
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[c.statut] || 'bg-gray-100 text-gray-600'}`}>
                        {c.statut}
                      </span>
                    </td>

                    {/* Actif/inactif */}
                    <td className="px-4 py-3">
                      {c.active
                        ? <span className="flex items-center gap-1 text-green-600"><CheckCircle size={15}/> Actif</span>
                        : <span className="flex items-center gap-1 text-red-500"><XCircle size={15}/> Inactif</span>
                      }
                    </td>

                    {/* Date désactivation */}
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {c.dateDesactivation
                        ? new Date(c.dateDesactivation).toLocaleString('fr-FR')
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {/* Changer statut membre */}
                        <button
                          onClick={() => openModalStatut(c)}
                          title="Changer le statut membre"
                          className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition-colors"
                        >
                          <Tag size={16} />
                        </button>

                        {/* Activer / Désactiver */}
                        <button
                          onClick={() => toggleActivation(c)}
                          title={c.active ? 'Désactiver le compte' : 'Réactiver le compte'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            c.active
                              ? 'hover:bg-red-50 text-red-500'
                              : 'hover:bg-green-50 text-green-600'
                          }`}
                        >
                          {c.active ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Historique des actions ───────────────────────────────────── */}
      <Card className="p-0 overflow-hidden">
        {/* En-tête cliquable */}
        <button
          onClick={() => setHistExpanded(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <History size={20} className="text-primary" />
            <div className="text-left">
              <h2 className="font-semibold text-gray-800">Historique des actions sur les comptes</h2>
              <p className="text-xs text-gray-400">Activations, désactivations, changements de rôle et de statut</p>
            </div>
            {historique.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                {historique.length}
              </span>
            )}
          </div>
          {histExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {histExpanded && (
          <>
            {/* Filtres historique */}
            <div className="px-5 pb-3 pt-1 border-t flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrer par membre ou admin…"
                  value={histFilter}
                  onChange={e => setHistFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <select
                value={histActionFilter}
                onChange={e => setHistActionFilter(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
              >
                <option value="">Toutes les actions</option>
                <option value="DESACTIVATION_COMPTE">Désactivations</option>
                <option value="REACTIVATION_COMPTE">Réactivations</option>
                <option value="CHANGEMENT_STATUT">Changements de statut</option>
                <option value="CHANGEMENT_ROLE">Changements de rôle</option>
              </select>
              <button
                onClick={fetchHistorique}
                className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
              >
                <RefreshCw size={13} /> Actualiser
              </button>
            </div>

            {/* Table historique */}
            {histLoading ? (
              <div className="py-10 text-center text-gray-400 text-sm">Chargement…</div>
            ) : (() => {
              const q = histFilter.toLowerCase();
              const filtered = historique.filter(h => {
                const matchText = !q || h.details?.toLowerCase().includes(q) || h.utilisateur?.toLowerCase().includes(q);
                const matchAction = !histActionFilter || h.action === histActionFilter;
                return matchText && matchAction;
              });

              // Associer nom du membre à partir des comptes chargés
              const getMembreNom = (id: number) => {
                const c = comptes.find(x => x.id === id);
                return c ? `${c.prenom} ${c.nom}` : `#${id}`;
              };

              if (filtered.length === 0) {
                return <div className="py-10 text-center text-gray-400 text-sm border-t">Aucun événement trouvé.</div>;
              }

              return (
                <div className="overflow-x-auto border-t">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Membre concerné</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Détails</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Effectué par</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Date & heure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map(h => {
                        const meta = ACTION_META[h.action] ?? { label: h.action, color: 'bg-gray-100 text-gray-600', icon: <History size={14} /> };
                        return (
                          <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar
                                  nom={comptes.find(x => x.id === h.membreId)?.nom}
                                  prenom={comptes.find(x => x.id === h.membreId)?.prenom}
                                  photo={comptes.find(x => x.id === h.membreId)?.photo}
                                  size={30}
                                />
                                <span className="font-medium text-gray-800">{getMembreNom(h.membreId)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                                {meta.icon} {meta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 max-w-xs">
                              <span className="text-xs leading-relaxed">{h.details}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{h.utilisateur}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                              {new Date(h.date).toLocaleString('fr-FR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </>
        )}
      </Card>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white text-sm px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}

      {/* Modal changement de statut */}
      {modalStatut && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <Tag size={22} className="text-orange-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Changer le statut membre</h2>
                <p className="text-sm text-gray-500">{modalStatut.prenom} {modalStatut.nom}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Statut actuel</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUT_COLORS[modalStatut.statut] || 'bg-gray-100'}`}>
                  {modalStatut.statut}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau statut</label>
                <select value={newStatut} onChange={e => setNewStatut(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none">
                  {STATUTS_MEMBRE.map(s => (
                    <option key={s.code} value={s.code}>{s.label}</option>
                  ))}
                </select>
              </div>
              {newStatut !== 'ANCIEN' && modalStatut.statut === 'ANCIEN' && (
                <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  ✓ Ce changement réactivera automatiquement le compte.
                </p>
              )}
              {newStatut === 'ANCIEN' && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  ⚠ Ce membre ne pourra plus se connecter.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalStatut(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</button>
              <button onClick={saveStatut} disabled={saving || newStatut === modalStatut.statut}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">
                {saving ? 'Enregistrement…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
