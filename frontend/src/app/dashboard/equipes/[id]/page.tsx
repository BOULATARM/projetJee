'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import { Equipe, EquipeHistoriqueEntry, MembreResponse, RoleSysteme } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, GraduationCap, Users, UserPlus, UserMinus, Pencil, Check, X, History, LogIn, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import api from '@/lib/api';
import { membreService } from '@/services/membre.service';
import { toArray } from '@/lib/normalize';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function EquipeDetailPage() {
  const { id } = useParams();
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [allMembres, setAllMembres] = useState<MembreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nom: '', description: '', axeRecherche: '' });
  const [addMembreId, setAddMembreId] = useState('');
  const [newChefId, setNewChefId] = useState('');
  const [changingChef, setChangingChef] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removeError, setRemoveError] = useState('');
  const [historique, setHistorique] = useState<EquipeHistoriqueEntry[]>([]);
  const [filtreNom, setFiltreNom] = useState('');
  const { role, membreId: currentMembreId } = useAuthStore();
  const isChefOfThisEquipe = equipe?.chefEquipe?.id === currentMembreId;
  const canManage = role === RoleSysteme.DIRECTEUR || role === RoleSysteme.VICE_DIRECTEUR || isChefOfThisEquipe;

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [eqRes, membresRes, histRes] = await Promise.all([
        api.get(`/equipes/${id}`),
        api.get(`/equipes/${id}/membres`),
        api.get(`/equipes/${id}/historique`),
      ]);
      setEquipe(eqRes.data);
      setForm({
        nom: eqRes.data.nom || '',
        description: eqRes.data.description || '',
        axeRecherche: eqRes.data.axeRecherche || '',
      });
      setMembres(toArray(membresRes.data));
      setHistorique(toArray(histRes.data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    membreService.getAll().then(setAllMembres).catch(() => {});
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await api.put(`/equipes/${id}`, null, { params: { nom: form.nom, description: form.description } });
      await load();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMembre = async () => {
    if (!id || !addMembreId) return;
    await api.post(`/equipes/${id}/membres`, null, { params: { membreId: Number(addMembreId) } });
    setAddMembreId('');
    await load();
  };

  const handleChangerChef = async () => {
    if (!id || !newChefId) return;
    setChangingChef(true);
    try {
      await api.put(`/equipes/${id}/chef`, null, { params: { chefId: Number(newChefId) } });
      setNewChefId('');
      await load();
    } finally {
      setChangingChef(false);
    }
  };

  const handleRemoveMembre = async (membreId: number) => {
    if (!id) return;
    if (equipe?.chefEquipe?.id === membreId) {
      setRemoveError('Impossible de retirer le chef d\'équipe. Veuillez d\'abord désigner un autre chef.');
      return;
    }
    setRemoveError('');
    await api.delete(`/equipes/${id}/membres/${membreId}`);
    await load();
  };

  if (loading) return <div className="text-gray-500 p-6">Chargement...</div>;
  if (!equipe) return <div className="text-red-500 p-6">Équipe introuvable.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/equipes" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft size={20} /> Retour aux équipes
        </Link>
        {canManage && !editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm text-primary border border-primary px-3 py-1 rounded-lg hover:bg-primary hover:text-white transition-colors">
            <Pencil size={14} /> Modifier
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary rounded-lg">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{equipe.nom}</h1>
                {equipe.dateCreation && (
                  <p className="text-xs text-gray-400">Créée le {formatDate(equipe.dateCreation)}</p>
                )}
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-3">
                <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="Nom *" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                <input value={form.axeRecherche} onChange={e => setForm({ ...form, axeRecherche: e.target.value })}
                  placeholder="Axe de recherche" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-1">
                    <Check size={14} /> {saving ? 'Enregistrement...' : 'Sauvegarder'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    <X size={14} />
                  </button>
                </div>
              </form>
            ) : (
              <>
                {equipe.axeRecherche && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Axe de recherche</p>
                    <Badge className="bg-blue-100 text-blue-800">{equipe.axeRecherche}</Badge>
                  </div>
                )}
                {equipe.description && (
                  <p className="text-sm text-gray-600">{equipe.description}</p>
                )}
                {equipe.chefEquipe && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-1">Chef d&apos;équipe</p>
                    <Link href={`/dashboard/membres/${equipe.chefEquipe.id}`} className="flex items-center gap-2 hover:text-primary">
                      <Avatar photo={equipe.chefEquipe.photo} nom={equipe.chefEquipe.nom} prenom={equipe.chefEquipe.prenom} size={32} />
                      <span className="text-sm font-medium">{equipe.chefEquipe.prenom} {equipe.chefEquipe.nom}</span>
                    </Link>
                  </div>
                )}
                {canManage && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Changer le chef d&apos;équipe</p>
                    <div className="flex gap-2">
                      <select value={newChefId} onChange={e => setNewChefId(e.target.value)}
                        className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                        <option value="">Sélectionner un membre...</option>
                        {membres
                          .filter(m => m.id !== equipe.chefEquipe?.id)
                          .map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
                      </select>
                      <button onClick={handleChangerChef} disabled={!newChefId || changingChef}
                        className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 flex items-center gap-1">
                        <Check size={14} /> OK
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users size={18} /> Membres actifs ({membres.length})
              </h2>
            </div>

            {canManage && (
              <div className="flex gap-2 mb-4">
                <select value={addMembreId} onChange={e => setAddMembreId(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Ajouter un membre...</option>
                  {allMembres
                    .filter(m => !membres.some(em => em.id === m.id))
                    .map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
                </select>
                <button onClick={handleAddMembre} disabled={!addMembreId}
                  className="bg-primary text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center gap-1">
                  <UserPlus size={16} /> Ajouter
                </button>
              </div>
            )}

            {removeError && (
              <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                <X size={14} className="shrink-0" />
                {removeError}
              </div>
            )}
            <div className="space-y-2">
              {membres.map(m => {
                const isChef = equipe.chefEquipe?.id === m.id;
                return (
                  <div key={m.id} className={`flex items-center justify-between p-3 rounded-lg ${isChef ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                    <Link href={`/dashboard/membres/${m.id}`} className="flex items-center gap-3 hover:text-primary flex-1">
                      <Avatar photo={m.photo} nom={m.nom} prenom={m.prenom} size={36} />
                      <div>
                        <p className="font-medium text-sm">{m.prenom} {m.nom}</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge className={`${getStatutColor(m.statut)} text-xs`}>{m.statut}</Badge>
                          {isChef && <Badge className="bg-primary text-white text-xs">Chef d&apos;équipe</Badge>}
                        </div>
                      </div>
                    </Link>
                    {canManage && (
                      <button
                        onClick={() => handleRemoveMembre(m.id)}
                        className={`p-1 ml-2 ${isChef ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600'}`}
                        title={isChef ? 'Désignez d\'abord un autre chef' : 'Retirer du groupe'}
                      >
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
              {membres.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Aucun membre actif dans cette équipe.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Historique des actions */}
      <div className="mt-6">
        <Card>
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History size={18} /> Historique des actions
            </h2>
            <input
              type="text"
              value={filtreNom}
              onChange={e => setFiltreNom(e.target.value)}
              placeholder="Filtrer par nom..."
              className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none w-52"
            />
          </div>
          {historique.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun historique disponible. Les actions futures seront enregistrées ici.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-2 pr-4">Membre</th>
                    <th className="pb-2 pr-4">Par</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historique
                    .filter(h => {
                      if (!filtreNom.trim()) return true;
                      const full = `${h.membre.prenom} ${h.membre.nom}`.toLowerCase();
                      return full.includes(filtreNom.toLowerCase());
                    })
                    .map(h => (
                      <tr key={h.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2 pr-4">
                          <Link href={`/dashboard/membres/${h.membre.id}`} className="flex items-center gap-2 hover:text-primary">
                            <Avatar photo={h.membre.photo} nom={h.membre.nom} prenom={h.membre.prenom} size={28} />
                            <span className="font-medium">{h.membre.prenom} {h.membre.nom}</span>
                          </Link>
                        </td>
                        <td className="py-2 pr-4">
                          {h.performedBy ? (
                            <Link href={`/dashboard/membres/${h.performedBy.id}`} className="flex items-center gap-2 hover:text-primary">
                              <Avatar photo={h.performedBy.photo} nom={h.performedBy.nom} prenom={h.performedBy.prenom} size={28} />
                              <span className="font-medium">{h.performedBy.prenom} {h.performedBy.nom}</span>
                            </Link>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-gray-500 text-sm whitespace-nowrap">
                          {new Date(h.date).toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2">
                          {h.action === 'MEMBRE_AJOUTE' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                              <LogIn size={11} /> Membre ajouté
                            </span>
                          )}
                          {h.action === 'MEMBRE_RETIRE' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                              <LogOut size={11} /> Membre retiré
                            </span>
                          )}
                          {h.action === 'CHEF_NOMME' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                              <GraduationCap size={11} /> Nommé chef d&apos;équipe
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
