'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import { Equipe, MembreResponse, RoleSysteme } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, GraduationCap, Users, UserPlus, UserMinus, Pencil, Check, X } from 'lucide-react';
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
  const [saving, setSaving] = useState(false);
  const { role } = useAuthStore();
  const canManage = role === RoleSysteme.ADMIN || role === RoleSysteme.DIRECTEUR;

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [eqRes, membresRes] = await Promise.all([
        api.get(`/equipes/${id}`),
        api.get(`/equipes/${id}/membres`),
      ]);
      setEquipe(eqRes.data);
      setForm({
        nom: eqRes.data.nom || '',
        description: eqRes.data.description || '',
        axeRecherche: eqRes.data.axeRecherche || '',
      });
      setMembres(toArray(membresRes.data));
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

  const handleRemoveMembre = async (membreId: number) => {
    if (!id) return;
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
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {equipe.chefEquipe.prenom[0]}{equipe.chefEquipe.nom[0]}
                      </div>
                      <span className="text-sm font-medium">{equipe.chefEquipe.prenom} {equipe.chefEquipe.nom}</span>
                    </Link>
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

            <div className="space-y-2">
              {membres.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Link href={`/dashboard/membres/${m.id}`} className="flex items-center gap-3 hover:text-primary flex-1">
                    {m.photo
                      ? <img src={`${API_BASE.replace('/api/v1', '')}/uploads/${m.photo}`} alt="" className="w-9 h-9 rounded-full object-cover border border-primary" />
                      : <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {m.prenom[0]}{m.nom[0]}
                        </div>
                    }
                    <div>
                      <p className="font-medium text-sm">{m.prenom} {m.nom}</p>
                      <Badge className={`${getStatutColor(m.statut)} text-xs`}>{m.statut}</Badge>
                    </div>
                  </Link>
                  {canManage && (
                    <button onClick={() => handleRemoveMembre(m.id)}
                      className="text-red-400 hover:text-red-600 p-1 ml-2" title="Retirer du groupe">
                      <UserMinus size={16} />
                    </button>
                  )}
                </div>
              ))}
              {membres.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Aucun membre actif dans cette équipe.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
