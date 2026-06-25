'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { Equipe, MembreResponse, RoleSysteme } from '@/types';
import { formatDate } from '@/lib/utils';
import { GraduationCap, PlusCircle, Users, X, ArrowRight, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { membreService } from '@/services/membre.service';
import { equipeService } from '@/services/equipe.service';
import { toArray } from '@/lib/normalize';

export default function EquipesPage() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [equipeMembers, setEquipeMembers] = useState<Record<number, MembreResponse[]>>({});
  const [form, setForm] = useState({ nom: '', description: '', axeRecherche: '', dateCreation: '', chefEquipeId: '' });
  const [saving, setSaving] = useState(false);
  const { role, membreId: currentMembreId } = useAuthStore();
  const canCreate = role === RoleSysteme.DIRECTEUR || role === RoleSysteme.VICE_DIRECTEUR;
  const isReadOnly = role === RoleSysteme.ADMIN;
  const canDeleteEquipe = (eq: Equipe) =>
    !isReadOnly && (role === RoleSysteme.DIRECTEUR || role === RoleSysteme.VICE_DIRECTEUR || eq.chefEquipe?.id === currentMembreId);
  const handleDelete = async (id: number, nom: string) => {
    if (!confirm(`Supprimer l'équipe "${nom}" ? Cette action est irréversible.`)) return;
    try {
      await equipeService.delete(id);
      load();
    } catch { alert('Erreur lors de la suppression.'); }
  };

  const load = () => {
    api.get('/equipes').then(res => setEquipes(toArray(res.data))).catch(() => {});
  };

  useEffect(() => {
    load();
    membreService.getAll().then(setMembres).catch(() => {});
  }, []);

  const toggleMembers = async (equipeId: number) => {
    if (expandedId === equipeId) { setExpandedId(null); return; }
    setExpandedId(equipeId);
    if (!equipeMembers[equipeId]) {
      try {
        const res = await api.get(`/equipes/${equipeId}/membres`);
        setEquipeMembers(prev => ({ ...prev, [equipeId]: res.data }));
      } catch { setEquipeMembers(prev => ({ ...prev, [equipeId]: [] })); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/equipes/complet', {
        nom: form.nom,
        description: form.description || undefined,
        axeRecherche: form.axeRecherche || undefined,
        dateCreation: form.dateCreation || undefined,
        chefEquipeId: form.chefEquipeId ? Number(form.chefEquipeId) : undefined,
      });
      setForm({ nom: '', description: '', axeRecherche: '', dateCreation: '', chefEquipeId: '' });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Équipes de recherche</h1>
        {canCreate && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            {showForm ? <X size={18} /> : <PlusCircle size={18} />}
            {showForm ? 'Annuler' : 'Nouvelle équipe'}
          </button>
        )}
      </div>

      {showForm && canCreate && (
        <Card className="mb-6 border-l-4 border-primary">
          <h2 className="font-semibold text-gray-700 mb-4">Créer une équipe</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <input
                required
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
                placeholder="Nom de l'équipe *"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <input
                value={form.axeRecherche}
                onChange={e => setForm({ ...form, axeRecherche: e.target.value })}
                placeholder="Axe de recherche"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date de création</label>
              <input
                type="date"
                value={form.dateCreation}
                onChange={e => setForm({ ...form, dateCreation: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <select
                value={form.chefEquipeId}
                onChange={e => setForm({ ...form, chefEquipeId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Chef d&apos;équipe (optionnel)</option>
                {membres.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-2 rounded-lg disabled:opacity-50">
                {saving ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {equipes.map((eq) => (
          <Card key={eq.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary rounded-lg">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold">{eq.nom}</h2>
                {eq.chefEquipe && (
                  <p className="text-sm text-gray-500">Chef: {eq.chefEquipe.prenom} {eq.chefEquipe.nom}</p>
                )}
                {eq.dateCreation && (
                  <p className="text-xs text-gray-400">Créée le {formatDate(eq.dateCreation)}</p>
                )}
              </div>
            </div>
            {eq.description && <p className="text-sm text-gray-600 mb-3">{eq.description}</p>}
            {eq.axeRecherche && (
              <div className="mb-3">
                <Badge className="bg-blue-100 text-blue-800">{eq.axeRecherche}</Badge>
              </div>
            )}
            <div className="flex items-center gap-4 mb-2">
              <Link href={`/dashboard/equipes/${eq.id}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                Voir détails <ArrowRight size={14} />
              </Link>
              {canDeleteEquipe(eq) && (
                <button
                  onClick={() => handleDelete(eq.id, eq.nom)}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 hover:underline ml-auto"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              )}
            </div>
            <button
              onClick={() => toggleMembers(eq.id)}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Users size={16} />
              {expandedId === eq.id ? 'Masquer les membres' : 'Voir les membres'}
            </button>
            {expandedId === eq.id && (
              <div className="mt-3 space-y-1 border-t pt-3">
                {(equipeMembers[eq.id] || []).length === 0
                  ? <p className="text-sm text-gray-400">Aucun membre actif</p>
                  : (equipeMembers[eq.id] || []).map(m => (
                    <div key={m.id} className="flex items-center gap-2 text-sm">
                      <Avatar photo={m.photo} nom={m.nom} prenom={m.prenom} size={28} />
                      <span>{m.prenom} {m.nom}</span>
                      <Badge className="bg-gray-100 text-gray-600 text-xs">{m.statut}</Badge>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
