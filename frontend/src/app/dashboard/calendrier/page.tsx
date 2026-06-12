'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { evenementService } from '@/services/evenement.service';
import { EvenementResponse } from '@/types';
import { formatDateTime, getStatutColor } from '@/lib/utils';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toArray } from '@/lib/normalize';

interface CalEvent {
  id: number;
  titre: string;
  date: string;        // ISO string
  lieu?: string;
  statut: string;
  type: 'EVENEMENT' | 'REUNION';
  href: string;
}

function getMonthRange(month: string) {
  const [year, m] = month.split('-').map(Number);
  const debut = new Date(year, m - 1, 1, 0, 0, 0);
  const fin   = new Date(year, m,     0, 23, 59, 59);
  return { debut: debut.toISOString(), fin: fin.toISOString() };
}

function inMonth(isoDate: string, month: string) {
  return isoDate?.slice(0, 7) === month;
}

export default function CalendrierPage() {
  const { membreId } = useAuthStore();
  const defaultMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(defaultMonth);
  const [evenements, setEvenements] = useState<EvenementResponse[]>([]);
  const [reunions, setReunions] = useState<CalEvent[]>([]);

  // Charger tous les événements (non annulés)
  useEffect(() => {
    const { debut, fin } = getMonthRange(month);
    evenementService.getCalendrier(debut, fin)
      .then(data => setEvenements(data.filter(e => e.statut !== 'ANNULE')))
      .catch(() => {
        evenementService.getAll()
          .then(data => setEvenements(data.filter(e => e.statut !== 'ANNULE')))
          .catch(() => {});
      });
  }, [month]);

  // Charger les réunions où le membre est participant
  useEffect(() => {
    if (!membreId) return;
    api.get('/reunions').then(res => {
      const all = toArray(res.data) as Array<{
        id: number; titre: string; dateReunion: string; lieu?: string; statut: string;
        participants?: Array<{ membreId: number }>;
      }>;
      const mine = all.filter(r =>
        inMonth(r.dateReunion, month) &&
        r.participants?.some(p => p.membreId === membreId)
      );
      setReunions(mine.map(r => ({
        id: r.id,
        titre: r.titre,
        date: r.dateReunion,
        lieu: r.lieu,
        statut: r.statut,
        type: 'REUNION' as const,
        href: `/dashboard/reunions/${r.id}`,
      })));
    }).catch(() => {});
  }, [month, membreId]);

  // Fusionner et grouper par jour
  const grouped = useMemo(() => {
    const all: CalEvent[] = [
      ...evenements.map(e => ({
        id: e.id,
        titre: e.titre,
        date: e.dateDebut,
        lieu: e.lieu,
        statut: e.statut,
        type: 'EVENEMENT' as const,
        href: `/dashboard/evenements/${e.id}`,
      })),
      ...reunions,
    ];

    // Trier par date
    all.sort((a, b) => a.date.localeCompare(b.date));

    return all.reduce<Record<string, CalEvent[]>>((acc, item) => {
      const day = item.date.slice(0, 10);
      acc[day] = [...(acc[day] || []), item];
      return acc;
    }, {});
  }, [evenements, reunions]);

  const total = Object.values(grouped).flat().length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Calendrier</h1>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {/* Légende */}
      <div className="flex gap-4 mb-4">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-primary inline-block" /> Événement
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" /> Réunion
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([day, items]) => (
          <Card key={day}>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={18} className="text-primary" />
              <h2 className="font-semibold text-gray-700">
                {new Date(day + 'T12:00:00').toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </h2>
              <span className="ml-auto text-xs text-gray-400">{items.length} élément(s)</span>
            </div>
            <div className="space-y-2">
              {items.map(item => (
                <Link key={`${item.type}-${item.id}`} href={item.href}>
                  <div className={`border-l-4 pl-3 py-2 rounded-r-lg hover:bg-gray-50 transition-colors ${
                    item.type === 'REUNION' ? 'border-teal-500' : 'border-primary'
                  }`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-gray-800">{item.titre}</p>
                      <Badge className={`text-xs ${
                        item.type === 'REUNION'
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.type === 'REUNION' ? 'Réunion' : 'Événement'}
                      </Badge>
                      <Badge className={`text-xs ${getStatutColor(item.statut)}`}>{item.statut}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(item.date)}</p>
                    {item.lieu && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {item.lieu}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        ))}

        {total === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun événement ni réunion pour ce mois.</p>
          </div>
        )}
      </div>
    </div>
  );
}
