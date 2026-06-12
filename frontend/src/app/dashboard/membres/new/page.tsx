'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Equipe, StatutMembre, RoleSysteme } from '@/types';
import api from '@/lib/api';
import { ArrowLeft, Lock, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toArray } from '@/lib/normalize';
import { useAuthStore } from '@/store/authStore';

const STATUTS: StatutMembre[] = [StatutMembre.PERMANENT, StatutMembre.ASSOCIE, StatutMembre.DOCTORANT, StatutMembre.RETRAITE, StatutMembre.ANCIEN];

export default function NewMembrePage() {
  const router = useRouter();
  const { role } = useAuthStore();

  // L'admin ne peut pas créer un membre directement
  if (role === RoleSysteme.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
        <Lock size={36} className="opacity-30" />
        <p className="font-medium">Accès refusé</p>
        <p className="text-sm text-gray-400">L&apos;administrateur ne peut pas créer directement un membre.<br/>Les nouveaux membres rejoignent via une demande d&apos;adhésion.</p>
        <Link href="/dashboard/membres" className="mt-2 text-primary text-sm hover:underline">← Retour aux membres</Link>
      </div>
    );
  }
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '',
    statut: StatutMembre.PERMANENT,
    etablissementOrigine: '', laboratoireOrigine: '',
    biographie: '', centresInteret: '',
    dateNaissance: '', dateEmbauche: '',
    equipeId: '', actif: true,
  });

  useEffect(() => {
    api.get('/equipes').then(r => setEquipes(toArray(r.data))).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        motDePasse: form.motDePasse,
        statut: form.statut,
        etablissementOrigine: form.etablissementOrigine || undefined,
        laboratoireOrigine: form.laboratoireOrigine || undefined,
        biographie: form.biographie || undefined,
        centresInteret: form.centresInteret || undefined,
        dateNaissance: form.dateNaissance || undefined,
        dateEmbauche: form.dateEmbauche || undefined,
        active: form.actif,
      };
      const { data } = await api.post('/auth/register', payload);
      const membreId = data.membreId || data.id;

      if (photoFile && membreId) {
        const fd = new FormData();
        fd.append('file', photoFile);
        await api.post(`/membres/${membreId}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      if (form.equipeId && membreId) {
        await api.post(`/equipes/${form.equipeId}/membres`, null, { params: { membreId } });
      }
      router.push('/dashboard/membres');
    } catch {
      setError('Erreur lors de la création du membre.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link href="/dashboard/membres" className="flex items-center gap-2 text-primary mb-4 hover:underline">
        <ArrowLeft size={20} /> Retour aux membres
      </Link>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Nouveau membre</h1>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="grid gap-5">
          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)}
              className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-white" />
          </div>

          {/* Identité */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <input required type="password" value={form.motDePasse} onChange={e => setForm({ ...form, motDePasse: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>

          {/* Statut */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
              <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value as StatutMembre })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Équipe</label>
              <select value={form.equipeId} onChange={e => setForm({ ...form, equipeId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">Aucune équipe</option>
                {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nom}</option>)}
              </select>
            </div>
          </div>

          {/* Établissement */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Établissement d&apos;origine</label>
              <input value={form.etablissementOrigine} onChange={e => setForm({ ...form, etablissementOrigine: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Laboratoire d&apos;origine</label>
              <input value={form.laboratoireOrigine} onChange={e => setForm({ ...form, laboratoireOrigine: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                Date de naissance <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1"><Lock size={9} /> Confidentiel</Badge>
              </label>
              <input type="date" value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;embauche</label>
              <input type="date" value={form.dateEmbauche} onChange={e => setForm({ ...form, dateEmbauche: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
            <textarea rows={3} value={form.biographie} onChange={e => setForm({ ...form, biographie: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Centres d&apos;intérêt</label>
            <textarea rows={2} value={form.centresInteret} onChange={e => setForm({ ...form, centresInteret: e.target.value })}
              placeholder="IA, Machine Learning, Réseaux..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>

          {/* Actif toggle */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Compte actif</label>
            <button
              type="button"
              onClick={() => setForm({ ...form, actif: !form.actif })}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.actif ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.actif ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-gray-500">{form.actif ? 'Actif' : 'Inactif'}</span>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={saving} className="bg-primary text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={18} /> {saving ? 'Création...' : 'Créer le membre'}
          </button>
        </form>
      </Card>
    </div>
  );
}
