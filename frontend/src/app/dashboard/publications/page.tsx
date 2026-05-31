'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor } from '@/lib/utils';
import { publicationService } from '@/services/publication.service';
import { PublicationResponse, TypePublication } from '@/types';
import { Search, PlusCircle, X } from 'lucide-react';

const TYPES_PUB: TypePublication[] = ['ARTICLE', 'CONFERENCE', 'THESE', 'RAPPORT', 'LIVRE', 'CHAPITRE'];

export default function PublicationsPage() {
  const [publications, setPublications] = useState<PublicationResponse[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titre: '', annee: new Date().getFullYear(), typePublication: 'ARTICLE' as TypePublication,
    resume: '', doi: '', lienUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => publicationService.getAll().then(setPublications).catch(() => {});

  useEffect(() => { load(); }, []);

  const filtered = search
    ? publications.filter(p => p.titre.toLowerCase().includes(search.toLowerCase()))
    : publications;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await publicationService.create({ ...form });
      setForm({ titre: '', annee: new Date().getFullYear(), typePublication: 'ARTICLE', resume: '', doi: '', lienUrl: '' });
      setShowForm(false);
      load();
    } catch {
      setError('Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Publications</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
        >
          {showForm ? <X size={18} /> : <PlusCircle size={18} />}
          {showForm ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      {showForm && (
        <Card className="mb-6 border-l-4 border-primary">
          <h2 className="font-semibold text-gray-700 mb-4">Nouvelle publication</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <input
                required
                value={form.titre}
                onChange={e => setForm({ ...form, titre: e.target.value })}
                placeholder="Titre de la publication *"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Année *</label>
              <input
                type="number"
                required
                min={1990}
                max={2030}
                value={form.annee}
                onChange={e => setForm({ ...form, annee: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Type *</label>
              <select
                value={form.typePublication}
                onChange={e => setForm({ ...form, typePublication: e.target.value as TypePublication })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              >
                {TYPES_PUB.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <input
                value={form.doi}
                onChange={e => setForm({ ...form, doi: e.target.value })}
                placeholder="DOI (ex: 10.xxxx/...)"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <input
                value={form.lienUrl}
                onChange={e => setForm({ ...form, lienUrl: e.target.value })}
                placeholder="Lien URL"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <textarea
                rows={3}
                value={form.resume}
                onChange={e => setForm({ ...form, resume: e.target.value })}
                placeholder="Résumé"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            {error && <p className="md:col-span-2 text-red-500 text-sm">{error}</p>}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="relative mb-6">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher une publication..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((p) => (
          <Card key={p.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{p.titre}</h3>
                {p.resume && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.resume}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  {p.auteurs?.map(a => `${a.prenom} ${a.nom}`).join(', ')}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getStatutColor(p.typePub)}>{p.typePub}</Badge>
                  <span className="text-sm text-gray-500">{p.annee}</span>
                  {p.equipe && <span className="text-sm text-gray-500">Équipe: {p.equipe}</span>}
                </div>
              </div>
              {p.doi && (
                <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer"
                   className="text-primary text-sm hover:underline ml-4">
                  DOI
                </a>
              )}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">Aucune publication trouvée</p>
        )}
      </div>
    </div>
  );
}
