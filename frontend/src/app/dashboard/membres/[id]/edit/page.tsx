'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { membreService } from '@/services/membre.service';
import { Equipe, MembreDetail, RoleSysteme, StatutMembre } from '@/types';
import { toArray } from '@/lib/normalize';
import api from '@/lib/api';
import { ArrowLeft, Eye, EyeOff, ExternalLink, Lock, Save } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const STATUTS: StatutMembre[] = [StatutMembre.PERMANENT, StatutMembre.ASSOCIE, StatutMembre.DOCTORANT, StatutMembre.RETRAITE, StatutMembre.ANCIEN];
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function EditMembrePage() {
  const { id } = useParams();
  const router = useRouter();
  const { role, membreId: currentMembreId } = useAuthStore();
  const isSelf = currentMembreId === Number(id);

  // Bloquer l'accès si admin qui tente de modifier un autre membre
  if (role === RoleSysteme.ADMIN && !isSelf) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
        <Lock size={36} className="opacity-30" />
        <p className="font-medium">Accès refusé</p>
        <p className="text-sm text-gray-400 text-center">
          L&apos;administrateur ne peut pas modifier les données personnelles d&apos;un membre.
        </p>
        <Link href={`/dashboard/membres/${id}`} className="mt-2 text-primary text-sm hover:underline">
          ← Retour au profil
        </Link>
      </div>
    );
  }
  const [profil, setProfil] = useState<MembreDetail | null>(null);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [equipeId, setEquipeId] = useState<number | ''>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '',
    statut: StatutMembre.PERMANENT,
    etablissementOrigine: '', laboratoireOrigine: '',
    biographie: '', centresInteret: '',
    dateNaissance: '', dateEmbauche: '',
    actif: true,
  });

  useEffect(() => {
    if (!id) return;
    membreService.getById(Number(id)).then(p => {
      setProfil(p);
      setForm({
        nom: p.nom,
        prenom: p.prenom,
        email: p.email,
        statut: p.statut,
        etablissementOrigine: p.etablissementOrigine || '',
        laboratoireOrigine: p.laboratoireOrigine || '',
        biographie: p.biographie || '',
        centresInteret: p.centresInteret || '',
        dateNaissance: p.dateNaissance || '',
        dateEmbauche: p.dateEmbauche || '',
        actif: p.active ?? true,
      });
      const active = p.affiliations?.find(a => a.actif);
      if (active) setEquipeId(active.equipeId);
    }).catch(() => {});
    api.get('/equipes').then(r => setEquipes(toArray(r.data))).catch(() => {});
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');
    try {
      await membreService.update(Number(id), {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        statut: form.statut,
        etablissementOrigine: form.etablissementOrigine || undefined,
        laboratoireOrigine: form.laboratoireOrigine || undefined,
        biographie: form.biographie || undefined,
        centresInteret: form.centresInteret || undefined,
        dateNaissance: form.dateNaissance || undefined,
        dateEmbauche: form.dateEmbauche || undefined,
      } as Parameters<typeof membreService.update>[1]);

      if (photoFile) {
        const fd = new FormData();
        fd.append('file', photoFile);
        await api.post(`/membres/${id}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      if (equipeId !== '') {
        await api.put(`/membres/${id}/equipe?equipeId=${equipeId}`);
      }

      if (newPassword.trim().length >= 6) {
        await api.put(`/membres/${id}/password?newPassword=${encodeURIComponent(newPassword.trim())}`);
      }

      router.push(`/dashboard/membres/${id}`);
    } catch {
      setError('Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  if (!profil) return <div className="text-gray-500">Chargement...</div>;

  const photoUrl = profil.photo ? `${API_BASE.replace('/api/v1', '')}/uploads/${profil.photo}` : null;

  return (
    <div>
      <Link href={`/dashboard/membres/${id}`} className="flex items-center gap-2 text-primary mb-4 hover:underline">
        <ArrowLeft size={20} /> Retour au profil
      </Link>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">
        Modifier — {profil.prenom} {profil.nom}
      </h1>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="grid gap-5">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <Avatar photo={photoUrl ?? profil.photo} nom={profil.nom} prenom={profil.prenom} size={64} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouvelle photo</label>
              <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-white" />
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value as StatutMembre })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <label className="text-sm font-medium text-gray-700">Compte actif</label>
              <button type="button" onClick={() => setForm({ ...form, actif: !form.actif })}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.actif ? 'bg-primary' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.actif ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                Date de naissance
                <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1 text-xs"><Lock size={9} /> Confidentiel</Badge>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Équipe actuelle</label>
            <select value={equipeId} onChange={e => setEquipeId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
              <option value="">— Aucune équipe —</option>
              {equipes.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.nom}</option>
              ))}
            </select>
          </div>

          {profil.publications && profil.publications.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Publications</label>
              <ul className="space-y-2">
                {profil.publications.map(pub => (
                  <li key={pub.id} className="flex items-start justify-between gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <span className="font-medium text-gray-800">{pub.titre}</span>
                      <span className="ml-2 text-gray-400">({pub.annee})</span>
                      <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{pub.type}</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {pub.lienUrl && (
                        <a href={pub.lienUrl} target="_blank" rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1">
                          <ExternalLink size={14} /> Lien
                        </a>
                      )}
                      {pub.doi && (
                        <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                          className="text-gray-500 hover:underline flex items-center gap-1 text-xs">
                          DOI
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Changer le mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Lock size={14} /> Nouveau mot de passe <span className="text-gray-400 font-normal">(laisser vide pour ne pas changer)</span>
            </label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 caractères"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none pr-10" />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={saving} className="bg-primary text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={18} /> {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
          </button>
        </form>
      </Card>
    </div>
  );
}
