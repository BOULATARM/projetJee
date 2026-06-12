'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { Equipe } from '@/types';
import { toArray } from '@/lib/normalize';

interface RoleOption { id: number; code: string; label: string }

export default function AdhesionPage() {
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '', confirmPassword: '',
    motivation: '', typeMembreDemande: '',
    nomFaculte: '',       // PERMANENT
    nomLaboOrigine: '',   // ASSOCIE
    biographie: '', centresInteret: '',
    dateNaissance: '',
    equipeId: '' as number | '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [publicationLinks, setPublicationLinks] = useState<string[]>(['']);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Charge les rôles depuis GET /api/v1/roles
    api.get('/roles').then(r => setRoles(toArray(r.data))).catch(() => {
      setRoles([
        { id: 1, code: 'PERMANENT', label: 'Membre permanent' },
        { id: 2, code: 'ASSOCIE',   label: 'Membre associé' },
        { id: 3, code: 'DOCTORANT', label: 'Doctorant' },
      ]);
    });
    api.get('/equipes').then(r => setEquipes(toArray(r.data))).catch(() => {});
  }, []);

  const addPublication = () => setPublicationLinks(p => [...p, '']);
  const removePublication = (i: number) => setPublicationLinks(p => p.filter((_, idx) => idx !== i));
  const updatePublication = (i: number, val: string) => setPublicationLinks(p => p.map((x, idx) => idx === i ? val : x));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) { const r = new FileReader(); r.onloadend = () => setPhotoPreview(r.result as string); r.readAsDataURL(file); }
    else setPhotoPreview(null);
  };

  // Changement de rôle : réinitialise les champs conditionnels
  const handleRoleChange = (code: string) =>
    setForm(prev => ({ ...prev, typeMembreDemande: code, nomFaculte: '', nomLaboOrigine: '' }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.typeMembreDemande) { setError('Veuillez sélectionner un rôle.'); return; }
    if (form.motDePasse !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (form.motDePasse.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setLoading(true); setError('');
    try {
      const filledPubs = publicationLinks.filter(p => p.trim());
      const { confirmPassword, ...rest } = form; void confirmPassword;
      const payload = {
        ...rest,
        equipeId: form.equipeId !== '' ? form.equipeId : undefined,
        dateNaissance: form.dateNaissance || undefined,
        publications: filledPubs.length > 0 ? filledPubs.join('\n') : undefined,
        nomFaculte:     form.typeMembreDemande === 'PERMANENT' ? form.nomFaculte     : undefined,
        nomLaboOrigine: form.typeMembreDemande === 'ASSOCIE'   ? form.nomLaboOrigine : undefined,
      };
      const { data } = await api.post('/demandes-adhesion', payload);
      if (data.id) {
        if (photoFile) {
          const fd = new FormData(); fd.append('file', photoFile);
          await api.post(`/demandes-adhesion/${data.id}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        if (cvFile) {
          const fd = new FormData(); fd.append('file', cvFile);
          await api.post(`/demandes-adhesion/${data.id}/cv`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
      }
      setSuccess(true);
    } catch {
      setError('Erreur lors de la soumission. Vérifiez vos informations.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="text-center max-w-md">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-gray-800 mb-2">Demande envoyée !</h1>
          <p className="text-gray-500 mb-6">Votre demande a été soumise avec succès.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="text-primary hover:underline">Retour</Link>
            <Link href="/auth/login" className="bg-primary text-white px-4 py-2 rounded-lg">Connexion</Link>
          </div>
        </Card>
      </div>
    );
  }

  const field = (label: string, children: React.ReactNode, req = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
  const ic = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-primary mb-6 hover:underline text-sm">
          <ArrowLeft size={18} /> Retour à l&apos;accueil
        </Link>
        <Card>
          <h1 className="text-2xl font-heading font-bold text-gray-800 mb-1">Demande d&apos;adhésion</h1>
          <p className="text-gray-500 text-sm mb-6">Rejoignez le Laboratoire LIAS</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Photo */}
            <div className="flex items-center gap-5">
              <div className="shrink-0">
                {photoPreview
                  ? <img src={photoPreview} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
                  : <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400">👤</div>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-white" />
              </div>
            </div>

            {/* Identité */}
            <div className="grid grid-cols-2 gap-4">
              {field('Nom', <input type="text" required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className={ic} />, true)}
              {field('Prénom', <input type="text" required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} className={ic} />, true)}
            </div>
            {field('Email', <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={ic} />, true)}

            {/* Date de naissance */}
            {field('Date de naissance', <input type="date" required value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })} className={ic} />, true)}

            {/* Mots de passe */}
            <div className="grid grid-cols-2 gap-4">
              {field('Mot de passe',
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={form.motDePasse}
                    onChange={e => setForm({ ...form, motDePasse: e.target.value })}
                    placeholder="Min. 6 caractères" className={`${ic} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>, true)}
              {field('Confirmer le mot de passe',
                <input type={showPassword ? 'text' : 'password'} required value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className={ic} />, true)}
            </div>

            {/* Rôle — chargé dynamiquement depuis /api/v1/roles */}
            {field('Type de membre',
              <select required value={form.typeMembreDemande} onChange={e => handleRoleChange(e.target.value)} className={ic}>
                <option value="">— Sélectionner un rôle —</option>
                {roles.map(r => <option key={r.id} value={r.code}>{r.label}</option>)}
              </select>, true
            )}

            {/* Champ conditionnel PERMANENT */}
            {form.typeMembreDemande === 'PERMANENT' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                {field("Nom de la faculté",
                  <input type="text" required value={form.nomFaculte}
                    onChange={e => setForm({ ...form, nomFaculte: e.target.value })}
                    placeholder="Ex : Faculté des Sciences Ben M'Sik" className={ic} />, true
                )}
              </div>
            )}

            {/* Champ conditionnel ASSOCIE */}
            {form.typeMembreDemande === 'ASSOCIE' && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                {field("Nom du laboratoire d'origine",
                  <input type="text" required value={form.nomLaboOrigine}
                    onChange={e => setForm({ ...form, nomLaboOrigine: e.target.value })}
                    placeholder="Ex : LRIA, USTHB" className={ic} />, true
                )}
              </div>
            )}

            {/* Équipe */}
            {field("Équipe souhaitée",
              <select value={form.equipeId} onChange={e => setForm({ ...form, equipeId: e.target.value === '' ? '' : Number(e.target.value) })} className={ic}>
                <option value="">— Aucune préférence —</option>
                {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nom}</option>)}
              </select>
            )}

            {/* CV */}
            {field("CV (PDF)",
              <>
                <input type="file" accept=".pdf" onChange={e => setCvFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-white" />
                <p className="text-xs text-gray-400 mt-1">Format PDF uniquement (optionnel)</p>
              </>
            )}

            {/* Bio & intérêts */}
            {field("Biographie",
              <textarea rows={3} value={form.biographie} onChange={e => setForm({ ...form, biographie: e.target.value })}
                placeholder="Décrivez brièvement votre parcours..." className={ic} />
            )}
            {field("Centres d'intérêt",
              <input type="text" value={form.centresInteret} onChange={e => setForm({ ...form, centresInteret: e.target.value })}
                placeholder="Ex: IA, Machine Learning, Réseaux..." className={ic} />
            )}

            {/* Publications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Publications (liens)</label>
                <button type="button" onClick={addPublication}
                  className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Plus size={14} /> Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {publicationLinks.map((link, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="url" value={link} onChange={e => updatePublication(i, e.target.value)}
                      placeholder="https://doi.org/..." className={ic} />
                    {publicationLinks.length > 1 && (
                      <button type="button" onClick={() => removePublication(i)}
                        className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Motivation */}
            {field("Lettre de motivation",
              <textarea rows={4} value={form.motivation} onChange={e => setForm({ ...form, motivation: e.target.value })}
                placeholder="Décrivez votre motivation à rejoindre le laboratoire..." className={ic} />
            )}

            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50">
              {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
