'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor } from '@/lib/utils';
import { publicationService } from '@/services/publication.service';
import { PublicationResponse, TypePublication } from '@/types';
import { Search } from 'lucide-react';

const TYPES: TypePublication[] = [TypePublication.ARTICLE, TypePublication.CONFERENCE, TypePublication.THESE, TypePublication.RAPPORT, TypePublication.LIVRE, TypePublication.CHAPITRE];

export default function PublicPublicationsPage() {
  const [publications, setPublications] = useState<PublicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAnnee, setFilterAnnee] = useState('');

  const load = () => {
    setLoading(true);
    publicationService.getAll()
      .then(setPublications)
      .catch(() => setError('Impossible de charger les publications.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const annees = Array.from(new Set(publications.map(p => p.annee).filter(Boolean))).sort((a, b) => (b as number) - (a as number));

  const filtered = publications
    .filter(p => !filterType || p.typePub === filterType)
    .filter(p => !filterAnnee || String(p.annee) === filterAnnee)
    .filter(p => !search || p.titre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <Link href="/" className="text-2xl font-bold hover:opacity-90">LIAS</Link>
            <p className="text-blue-200 text-sm">Publications scientifiques</p>
          </div>
          <Link href="/auth/login" className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50">
            Connexion
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Publications</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une publication..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none">
            <option value="">Tous les types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterAnnee} onChange={e => setFilterAnnee(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none">
            <option value="">Toutes les années</option>
            {annees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {loading && <p className="text-center text-gray-400 py-12">Chargement...</p>}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-3">{error}</p>
            <button onClick={load} className="text-primary hover:underline">Réessayer</button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">Aucune publication trouvée.</p>
        )}

        <div className="space-y-4">
          {filtered.map(p => (
            <Card key={p.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{p.titre}</h3>
                  {p.resume && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.resume}</p>}
                  {p.auteurs?.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {p.auteurs.map(a => `${a.prenom} ${a.nom}`).join(', ')}
                    </p>
                  )}
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
                  </div>
                </div>
                {p.doi && (
                  <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline ml-4 shrink-0">DOI</a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>

      <footer className="bg-primary text-white text-center py-6 mt-12">
        <p className="text-sm">© 2025 LIAS - Faculté des Sciences Ben M&apos;Sik, Casablanca</p>
      </footer>
    </div>
  );
}
