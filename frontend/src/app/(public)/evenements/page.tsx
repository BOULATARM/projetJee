'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import { evenementService } from '@/services/evenement.service';
import { EvenementResponse, TypeEvenement } from '@/types';
import { CalendarDays, MapPin, Search } from 'lucide-react';

const TYPES: TypeEvenement[] = [TypeEvenement.CONFERENCE, TypeEvenement.SEMINAIRE, TypeEvenement.WORKSHOP, TypeEvenement.JOURNEE_ETUDE, TypeEvenement.REUNION];

export default function PublicEvenementsPage() {
  const [evenements, setEvenements] = useState<EvenementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const load = () => {
    setLoading(true);
    evenementService.getAll()
      .then(setEvenements)
      .catch(() => setError('Impossible de charger les événements.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = evenements
    .filter(e => e.statut === 'PLANIFIE' || e.statut === 'EN_COURS')
    .filter(e => !filterType || e.type === filterType)
    .filter(e => !search || e.titre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <Link href="/" className="text-2xl font-bold hover:opacity-90">LIAS</Link>
            <p className="text-blue-200 text-sm">Événements scientifiques</p>
          </div>
          <Link href="/auth/login" className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50">
            Connexion
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Événements scientifiques</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un événement..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">Tous les types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
          <p className="text-center text-gray-400 py-12">Aucun événement à venir.</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(e => (
            <Card key={e.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <Badge className={getStatutColor(e.statut)}>{e.statut}</Badge>
                <Badge className="bg-purple-100 text-purple-800">{e.type}</Badge>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{e.titre}</h3>
              {e.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{e.description}</p>}
              <div className="space-y-1 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  <span>{formatDate(e.dateDebut)}</span>
                </div>
                {e.lieu && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{e.lieu}</span>
                  </div>
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
