'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import { membreService } from '@/services/membre.service';
import { useAuthStore } from '@/store/authStore';
import { MembreDetail } from '@/types';
import { Mail, Calendar, Building, BookOpen, Edit2, X, Save } from 'lucide-react';

export default function ProfilPage() {
  const { membreId } = useAuthStore();
  const [profil, setProfil] = useState<MembreDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ biographie: '', centresInteret: '', etablissementOrigine: '', laboratoireOrigine: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const load = () => {
    if (membreId) {
      membreService.getById(membreId).then(p => {
        setProfil(p);
        setForm({
          biographie: p.biographie || '',
          centresInteret: p.centresInteret || '',
          etablissementOrigine: p.etablissementOrigine || '',
          laboratoireOrigine: p.laboratoireOrigine || '',
        });
      }).catch(() => {});
    }
  };

  useEffect(() => { load(); }, [membreId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profil || !membreId) return;
    setSaving(true);
    setSaveMsg('');
    try {
      await membreService.update(membreId, {
        nom: profil.nom,
        prenom: profil.prenom,
        email: profil.email,
        biographie: form.biographie,
        centresInteret: form.centresInteret,
        etablissementOrigine: form.etablissementOrigine,
        laboratoireOrigine: form.laboratoireOrigine,
      } as Parameters<typeof membreService.update>[1]);
      setEditing(false);
      setSaveMsg('Profil mis à jour.');
      load();
    } catch {
      setSaveMsg('Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  if (!profil) return <div className="text-gray-500">Chargement...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Mon Profil</h1>
        <button
          onClick={() => setEditing(!editing)}
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
        <Card className="md:col-span-1 text-center">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            {profil.prenom[0]}{profil.nom[0]}
          </div>
          <h2 className="text-xl font-bold">{profil.prenom} {profil.nom}</h2>
          <div className="flex justify-center gap-2 mt-2 flex-wrap">
            <Badge className={getStatutColor(profil.statut)}>{profil.statut}</Badge>
            <Badge className="bg-primary text-white">{profil.systemRole}</Badge>
          </div>
          <div className="mt-4 text-sm text-gray-500 space-y-2">
            <div className="flex items-center justify-center gap-2"><Mail size={16} /> {profil.email}</div>
            {profil.dateEmbauche && <div className="flex items-center justify-center gap-2"><Calendar size={16} /> Depuis {formatDate(profil.dateEmbauche)}</div>}
            {profil.etablissementOrigine && <div className="flex items-center justify-center gap-2"><Building size={16} /> {profil.etablissementOrigine}</div>}
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {editing ? (
            <Card>
              <h3 className="font-semibold mb-4">Modifier le profil</h3>
              <form onSubmit={handleSave} className="grid gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Biographie</label>
                  <textarea
                    rows={4}
                    value={form.biographie}
                    onChange={e => setForm({ ...form, biographie: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Votre biographie..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Centres d&apos;intérêt</label>
                  <textarea
                    rows={2}
                    value={form.centresInteret}
                    onChange={e => setForm({ ...form, centresInteret: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="IA, Machine Learning, Réseaux..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Établissement d&apos;origine</label>
                    <input
                      value={form.etablissementOrigine}
                      onChange={e => setForm({ ...form, etablissementOrigine: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Laboratoire d&apos;origine</label>
                    <input
                      value={form.laboratoireOrigine}
                      onChange={e => setForm({ ...form, laboratoireOrigine: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
              </form>
            </Card>
          ) : (
            <>
              {(profil.biographie || profil.centresInteret) && (
                <Card>
                  {profil.biographie && (
                    <>
                      <h3 className="font-semibold mb-2">Biographie</h3>
                      <p className="text-gray-600 text-sm">{profil.biographie}</p>
                    </>
                  )}
                  {profil.centresInteret && (
                    <>
                      <h4 className="font-semibold mt-4 mb-1">Centres d&apos;intérêt</h4>
                      <p className="text-gray-600 text-sm">{profil.centresInteret}</p>
                    </>
                  )}
                </Card>
              )}
            </>
          )}

          <Card>
            <h3 className="font-semibold mb-3">Historique des affiliations</h3>
            <div className="space-y-2">
              {profil.affiliations.length > 0 ? profil.affiliations.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{a.equipeNom}</p>
                    <p className="text-xs text-gray-500">{formatDate(a.dateDebut)}{a.dateFin ? ` - ${formatDate(a.dateFin)}` : ' - Présent'}</p>
                  </div>
                  {a.actif ? <Badge className="bg-green-100 text-green-800">Actif</Badge> : <Badge className="bg-gray-100 text-gray-600">Inactif</Badge>}
                </div>
              )) : <p className="text-sm text-gray-400">Aucune affiliation</p>}
            </div>
          </Card>

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
