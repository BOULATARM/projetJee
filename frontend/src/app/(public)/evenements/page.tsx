'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import { evenementService } from '@/services/evenement.service';
import { EvenementResponse, TypeEvenement } from '@/types';
import { CalendarDays, MapPin, Search } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { useT } from '@/hooks/useT';

const TYPES: TypeEvenement[] = [TypeEvenement.CONFERENCE, TypeEvenement.SEMINAIRE, TypeEvenement.WORKSHOP, TypeEvenement.JOURNEE_ETUDE, TypeEvenement.REUNION];

export default function PublicEvenementsPage() {
  const t = useT();
  const [evenements, setEvenements] = useState<EvenementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const load = () => {
    setLoading(true);
    evenementService.getAll()
      .then(setEvenements)
      .catch(() => setError(t.pub.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = evenements
    .filter(e => e.statut === 'PLANIFIE' || e.statut === 'EN_COURS')
    .filter(e => !filterType || e.type === filterType)
    .filter(e => !search || e.titre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-stone-900">
      <PublicHeader title="LIAS" subtitle={t.pub.eventsSubtitle} fullNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">{t.pub.eventsTitle}</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.pub.eventsSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
          >
            <option value="">{t.pub.allTypes}</option>
            {TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
          </select>
        </div>

        {loading && <p className="text-center text-gray-400 py-12">{t.pub.loading}</p>}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-3">{error}</p>
            <button onClick={load} className="text-primary hover:underline">{t.pub.retry}</button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">{t.pub.noEvents}</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(e => (
            <Card key={e.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <Badge className={getStatutColor(e.statut)}>{e.statut}</Badge>
                <Badge className="bg-purple-100 text-purple-800">{e.type}</Badge>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-stone-100 mb-2">{e.titre}</h3>
              {e.description && <p className="text-sm text-gray-500 dark:text-stone-400 mb-3 line-clamp-2">{e.description}</p>}
              <div className="space-y-1 text-sm text-gray-500 dark:text-stone-400">
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
        <p className="text-sm">{t.pub.footer}</p>
      </footer>
    </div>
  );
}
