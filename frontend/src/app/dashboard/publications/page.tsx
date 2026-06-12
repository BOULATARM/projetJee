'use client';
import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor } from '@/lib/utils';
import { publicationService } from '@/services/publication.service';
import { Equipe, MembreResponse, PublicationResponse, TypePublication } from '@/types';
import { Search, PlusCircle, X, FileText, UserPlus, GripVertical } from 'lucide-react';
import api from '@/lib/api';
import { toArray } from '@/lib/normalize';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '');

const TYPES_PUB: TypePublication[] = [TypePublication.ARTICLE, TypePublication.CONFERENCE, TypePublication.THESE, TypePublication.RAPPORT, TypePublication.LIVRE, TypePublication.CHAPITRE];

export default function PublicationsPage() {
  const [publications, setPublications] = useState<PublicationResponse[]>([]);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [search, setSearch] = useState('');
  const [filterAuteur, setFilterAuteur] = useState('');
  const [filterAnnee, setFilterAnnee] = useState('');
  const [filterEquipe, setFilterEquipe] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titre: '', annee: new Date().getFullYear(), typePublication: TypePublication.ARTICLE,
    resume: '', doi: '', lienUrl: '', revue: '', conference: '',
  });
  const [selectedAuteurs, setSelectedAuteurs] = useState<MembreResponse[]>([]);
  const [auteurSearch, setAuteurSearch] = useState('');
  const [fichierPdf, setFichierPdf] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const params: Record<string, unknown> = {};
    if (filterAuteur) params.auteurId = Number(filterAuteur);
    if (filterAnnee) params.annee = Number(filterAnnee);
    if (filterEquipe) params.equipeId = Number(filterEquipe);
    const { data } = await api.get('/publications', { params });
    setPublications(toArray(data));
  };

  useEffect(() => {
    load();
    api.get('/membres').then(r => setMembres(toArray(r.data))).catch(() => {});
    api.get('/equipes').then(r => setEquipes(toArray(r.data))).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filterAuteur, filterAnnee, filterEquipe]);

  const filtered = useMemo(() => search
    ? publications.filter(p => p.titre.toLowerCase().includes(search.toLowerCase()))
    : publications,
    [publications, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fichierPdf) { setError('Le fichier PDF est obligatoire.'); return; }
    if (fichierPdf.type !== 'application/pdf') { setError('Le fichier doit être au format PDF.'); return; }
    if (fichierPdf.size > 20 * 1024 * 1024) { setError('Le fichier PDF ne doit pas dépasser 20 Mo.'); return; }
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      const auteurIds = selectedAuteurs.map(m => m.id);
      const ordresAuteurs = selectedAuteurs.map((_, i) => i + 1);
      formData.append('data', new Blob([JSON.stringify({ ...form, auteurIds, ordresAuteurs })], { type: 'application/json' }));
      formData.append('fichierPdf', fichierPdf);
      await api.post('/publications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({ titre: '', annee: new Date().getFullYear(), typePublication: TypePublication.ARTICLE, resume: '', doi: '', lienUrl: '', revue: '', conference: '' });
      setSelectedAuteurs([]);
      setAuteurSearch('');
      setFichierPdf(null);
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Erreur lors de la création de la publication.');
    } finally {
      setSaving(false);
    }
  };

  const annees = Array.from(new Set(publications.map(p => p.annee).filter(Boolean))).sort((a, b) => (b as number) - (a as number));

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
              <input required value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })}
                placeholder="Titre de la publication *" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Année *</label>
              <input type="number" required min={1990} max={2030} value={form.annee} onChange={e => setForm({ ...form, annee: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <input value={form.doi} onChange={e => setForm({ ...form, doi: e.target.value })}
                placeholder="DOI (ex: 10.xxxx/...)" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <input value={form.lienUrl} onChange={e => setForm({ ...form, lienUrl: e.target.value })}
                placeholder="Lien URL" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <input value={form.revue} onChange={e => setForm({ ...form, revue: e.target.value })}
                placeholder="Revue / Journal" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <input value={form.conference} onChange={e => setForm({ ...form, conference: e.target.value })}
                placeholder="Conférence" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="md:col-span-2">
              <textarea rows={3} value={form.resume} onChange={e => setForm({ ...form, resume: e.target.value })}
                placeholder="Résumé" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            {/* Auteurs */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1 flex items-center gap-1">
                <UserPlus size={14} /> Auteurs <span className="text-gray-400 text-xs">(optionnel — vous pouvez vous inclure)</span>
              </label>

              {/* Recherche + ajout */}
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={auteurSearch}
                    onChange={e => setAuteurSearch(e.target.value)}
                    placeholder="Rechercher un membre..."
                    className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* Dropdown des résultats */}
              {auteurSearch.trim() && (
                <div className="border rounded-lg bg-white shadow-sm max-h-40 overflow-y-auto mb-2">
                  {membres
                    .filter(m =>
                      (`${m.prenom} ${m.nom}`).toLowerCase().includes(auteurSearch.toLowerCase()) &&
                      !selectedAuteurs.some(a => a.id === m.id)
                    )
                    .slice(0, 8)
                    .map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedAuteurs(prev => [...prev, m]);
                          setAuteurSearch('');
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2"
                      >
                        <UserPlus size={14} className="text-primary shrink-0" />
                        <span>{m.prenom} {m.nom}</span>
                        {m.statut && <span className="text-xs text-gray-400 ml-auto">{m.statut}</span>}
                      </button>
                    ))}
                  {membres.filter(m =>
                    (`${m.prenom} ${m.nom}`).toLowerCase().includes(auteurSearch.toLowerCase()) &&
                    !selectedAuteurs.some(a => a.id === m.id)
                  ).length === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-400">Aucun résultat</p>
                  )}
                </div>
              )}

              {/* Auteurs sélectionnés */}
              {selectedAuteurs.length > 0 && (
                <div className="space-y-1">
                  {selectedAuteurs.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 text-sm">
                      <GripVertical size={14} className="text-gray-400 shrink-0" />
                      <span className="text-primary font-medium text-xs w-5 shrink-0">#{i + 1}</span>
                      <span className="flex-1">{m.prenom} {m.nom}</span>
                      {m.statut && <span className="text-xs text-gray-400">{m.statut}</span>}
                      <button
                        type="button"
                        onClick={() => setSelectedAuteurs(prev => prev.filter(a => a.id !== m.id))}
                        className="text-red-400 hover:text-red-600 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 mt-1">L&apos;auteur #1 sera marqué comme auteur correspondant</p>
                </div>
              )}
            </div>

            {/* PDF obligatoire */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">
                Fichier PDF de l&apos;article <span className="text-red-500">*</span>
              </label>
              <input type="file" accept="application/pdf" required
                onChange={e => {
                  const f = e.target.files?.[0] || null;
                  if (f && f.size > 20 * 1024 * 1024) { setError('Le fichier ne doit pas dépasser 20 Mo.'); e.target.value = ''; return; }
                  setFichierPdf(f); setError('');
                }}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-white border rounded-lg px-3 py-2" />
              <p className="text-xs text-gray-400 mt-1">Format PDF uniquement, max 20 Mo. Obligatoire.</p>
            </div>
            {error && <p className="md:col-span-2 text-red-500 text-sm">{error}</p>}
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-2 rounded-lg disabled:opacity-50">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div className="grid sm:grid-cols-4 gap-3 mb-4">
        <div className="relative sm:col-span-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>
        <select value={filterAuteur} onChange={e => setFilterAuteur(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none">
          <option value="">Tous les auteurs</option>
          {membres.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
        </select>
        <select value={filterAnnee} onChange={e => setFilterAnnee(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none">
          <option value="">Toutes les années</option>
          {annees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filterEquipe} onChange={e => setFilterEquipe(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none">
          <option value="">Toutes les équipes</option>
          {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nom}</option>)}
        </select>
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
                {(p.revue || p.conference) && (
                  <p className="text-sm text-gray-400 mt-1 italic">
                    {p.revue && `Revue: ${p.revue}`}
                    {p.revue && p.conference && ' | '}
                    {p.conference && `Conférence: ${p.conference}`}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getStatutColor(p.typePub)}>{p.typePub}</Badge>
                  <span className="text-sm text-gray-500">{p.annee}</span>
                  {p.equipe && <span className="text-sm text-gray-500">Équipe: {p.equipe}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                {p.fichierPath && (
                  <a href={`${API_BASE}/api/v1/publications/${p.id}/download`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium">
                    <FileText size={16} /> PDF
                  </a>
                )}
                {p.doi && (
                  <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer"
                    className="text-primary text-xs hover:underline">DOI</a>
                )}
              </div>
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
