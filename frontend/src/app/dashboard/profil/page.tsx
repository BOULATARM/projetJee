'use client';
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { getStatutColor, formatDate } from '@/lib/utils';
import { membreService } from '@/services/membre.service';
import { useAuthStore } from '@/store/authStore';
import { MembreDetail } from '@/types';
import api from '@/lib/api';
import { Mail, Calendar, Building, BookOpen, Edit2, X, Save, Camera, User } from 'lucide-react';

interface Equipe { id: number; nom: string; }

interface FormState {
  nom: string; prenom: string; email: string;
  dateNaissance: string; biographie: string;
  centresInteret: string; etablissementOrigine: string;
  laboratoireOrigine: string; equipeId: string;
}

export default function ProfilPage() {
  const { membreId, setAuth, token, role, email: authEmail, statut: authStatut, nom: authNom, prenom: authPrenom } = useAuthStore();
  const [profil, setProfil]   = useState<MembreDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState<FormState>({
    nom: '', prenom: '', email: '', dateNaissance: '',
    biographie: '', centresInteret: '', etablissementOrigine: '', laboratoireOrigine: '', equipeId: '',
  });
  const [equipes, setEquipes]         = useState<Equipe[]>([]);
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile]       = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    if (!membreId) return;
    membreService.getById(membreId).then(p => {
      setProfil(p);
      const affActive = p.affiliations.find(a => a.actif);
      setForm({
        nom: p.nom || '', prenom: p.prenom || '', email: p.email || '',
        dateNaissance: p.dateNaissance || '', biographie: p.biographie || '',
        centresInteret: p.centresInteret || '',
        etablissementOrigine: p.etablissementOrigine || '',
        laboratoireOrigine: p.laboratoireOrigine || '',
        equipeId: affActive ? String(affActive.equipeId) : '',
      });
    }).catch(() => {});
  };

  useEffect(() => { load(); }, [membreId]);

  useEffect(() => {
    api.get('/equipes').then(r => {
      const raw = r.data;
      setEquipes(Array.isArray(raw) ? raw : raw?.content ?? []);
    }).catch(() => {});
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profil || !membreId) return;
    setSaving(true); setSaveMsg('');
    try {
      // 1. Upload photo
      if (photoFile) {
        const fd = new FormData();
        fd.append('file', photoFile);
        await api.post(`/membres/${membreId}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      // 2. Change team
      const affActive = profil.affiliations.find(a => a.actif);
      const currentEquipeId = affActive ? String(affActive.equipeId) : '';
      if (form.equipeId && form.equipeId !== currentEquipeId) {
        await api.put(`/membres/${membreId}/equipe`, null, { params: { equipeId: form.equipeId } });
      }

      // 3. Update fields
      const updated = await membreService.update(membreId, {
        nom: form.nom, prenom: form.prenom, email: form.email,
        biographie: form.biographie, centresInteret: form.centresInteret,
        etablissementOrigine: form.etablissementOrigine, laboratoireOrigine: form.laboratoireOrigine,
      } as Parameters<typeof membreService.update>[1]);

      // 4. Sync store → header updates immediately
      setAuth({
        token: token!, membreId: membreId!, email: updated.email ?? authEmail ?? '',
        role: role!, statut: authStatut ?? undefined,
        nom: updated.nom ?? authNom ?? '', prenom: updated.prenom ?? authPrenom ?? '',
        photo: updated.photo ?? undefined,
      });

      setEditing(false); setPhotoFile(null); setPhotoPreview(null);
      setSaveMsg('Profil mis à jour avec succès.');
      load();
    } catch {
      setSaveMsg('Erreur lors de la mise à jour.');
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setEditing(false); setPhotoFile(null); setPhotoPreview(null); setSaveMsg('');
    load();
  };

  if (!profil) return <div className="text-gray-500 p-6">Chargement...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Mon Profil</h1>
        <button
          onClick={() => editing ? handleCancel() : setEditing(true)}
          className="flex items-center gap-2 text-sm border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          {editing ? <X size={16} /> : <Edit2 size={16} />}
          {editing ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      {saveMsg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${saveMsg.includes('Erreur') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {saveMsg}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* ── Carte gauche ── */}
        <Card className="md:col-span-1 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Avatar photo={photoPreview ?? profil.photo} nom={profil.nom} prenom={profil.prenom} size={96} />
            {editing && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1.5 shadow hover:bg-gray-50"
                  title="Changer la photo"
                >
                  <Camera size={14} className="text-primary" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </>
            )}
          </div>

          <h2 className="text-xl font-bold">{profil.prenom} {profil.nom}</h2>
          <div className="flex justify-center gap-2 mt-2 flex-wrap">
            <Badge className={getStatutColor(profil.statut)}>{profil.statut}</Badge>
            <Badge className="bg-primary text-white">{profil.systemRole}</Badge>
          </div>
          <div className="mt-4 text-sm text-gray-500 space-y-2">
            <div className="flex items-center justify-center gap-2"><Mail size={16} />{profil.email}</div>
            {profil.dateEmbauche && <div className="flex items-center justify-center gap-2"><Calendar size={16} />Depuis {formatDate(profil.dateEmbauche)}</div>}
            {profil.etablissementOrigine && <div className="flex items-center justify-center gap-2"><Building size={16} />{profil.etablissementOrigine}</div>}
          </div>
        </Card>

        {/* ── Colonne droite ── */}
        <div className="md:col-span-2 space-y-6">

          {editing ? (
            /* ── Formulaire édition ── */
            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User size={18} className="text-primary" /> Modifier le profil
              </h3>
              <form onSubmit={handleSave} className="grid gap-4">

                {/* Nom / Prénom */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                    <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
                    <input required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>

                {/* Email (lecture seule) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} readOnly
                    className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-400 cursor-not-allowed outline-none" />
                </div>

                {/* Date de naissance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                  <input type="date" value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
                </div>

                {/* Équipe */}
                {equipes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Équipe</label>
                    <select value={form.equipeId} onChange={e => setForm({ ...form, equipeId: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white">
                      <option value="">— Aucune équipe —</option>
                      {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nom}</option>)}
                    </select>
                  </div>
                )}

                {/* Biographie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                  <textarea rows={4} value={form.biographie} onChange={e => setForm({ ...form, biographie: e.target.value })}
                    placeholder="Votre biographie..."
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
                </div>

                {/* Centres d'intérêt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Centres d&apos;intérêt</label>
                  <textarea rows={2} value={form.centresInteret} onChange={e => setForm({ ...form, centresInteret: e.target.value })}
                    placeholder="IA, Machine Learning, Réseaux..."
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
                </div>

                {/* Établissement / Labo */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Établissement d&apos;origine</label>
                    <input value={form.etablissementOrigine} onChange={e => setForm({ ...form, etablissementOrigine: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Laboratoire d&apos;origine</label>
                    <input value={form.laboratoireOrigine} onChange={e => setForm({ ...form, laboratoireOrigine: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>

                <button type="submit" disabled={saving}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 font-medium">
                  <Save size={18} />
                  {saving ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
              </form>
            </Card>
          ) : (
            /* ── Vue lecture ── */
            <Card>
              <h3 className="font-semibold mb-3">Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase mb-0.5">Nom complet</p>
                  <p className="font-medium">{profil.prenom} {profil.nom}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase mb-0.5">Email</p>
                  <p className="font-medium">{profil.email}</p>
                </div>
                {profil.dateNaissance && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase mb-0.5">Date de naissance</p>
                    <p className="font-medium">{formatDate(profil.dateNaissance)}</p>
                  </div>
                )}
                {profil.dateEmbauche && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase mb-0.5">Membre depuis</p>
                    <p className="font-medium">{formatDate(profil.dateEmbauche)}</p>
                  </div>
                )}
                {profil.etablissementOrigine && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase mb-0.5">Établissement</p>
                    <p className="font-medium">{profil.etablissementOrigine}</p>
                  </div>
                )}
                {profil.laboratoireOrigine && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase mb-0.5">Laboratoire d&apos;origine</p>
                    <p className="font-medium">{profil.laboratoireOrigine}</p>
                  </div>
                )}
              </div>
              {profil.biographie && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-gray-400 text-xs uppercase mb-1">Biographie</p>
                  <p className="text-gray-600 text-sm">{profil.biographie}</p>
                </div>
              )}
              {profil.centresInteret && (
                <div className="mt-3">
                  <p className="text-gray-400 text-xs uppercase mb-1">Centres d&apos;intérêt</p>
                  <p className="text-gray-600 text-sm">{profil.centresInteret}</p>
                </div>
              )}
            </Card>
          )}

          {/* Affiliations */}
          <Card>
            <h3 className="font-semibold mb-3">Historique des affiliations</h3>
            <div className="space-y-2">
              {profil.affiliations.length > 0 ? profil.affiliations.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{a.equipeNom}</p>
                    <p className="text-xs text-gray-500">{formatDate(a.dateDebut)}{a.dateFin ? ` — ${formatDate(a.dateFin)}` : ' — Présent'}</p>
                  </div>
                  {a.actif ? <Badge className="bg-green-100 text-green-800">Actif</Badge> : <Badge className="bg-gray-100 text-gray-600">Inactif</Badge>}
                </div>
              )) : <p className="text-sm text-gray-400">Aucune affiliation</p>}
            </div>
          </Card>

          {/* Publications */}
          {profil.publications.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} />
                <h3 className="font-semibold">Publications ({profil.publications.length})</h3>
              </div>
              <div className="space-y-2">
                {profil.publications.map(p => (
                  <div key={p.id} className="text-sm p-2 bg-gray-50 rounded">
                    <p className="font-medium">{p.titre}</p>
                    <span className="text-gray-500">{p.annee} • {p.type}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
