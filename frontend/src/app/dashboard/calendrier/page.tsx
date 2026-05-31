'use client';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { evenementService } from '@/services/evenement.service';
import { EvenementResponse } from '@/types';
import { formatDateTime, getStatutColor } from '@/lib/utils';
import { CalendarDays, MapPin } from 'lucide-react';

function getMonthRange(month: string) {
  const [year, monthIndex] = month.split('-').map(Number);
  const debut = new Date(year, monthIndex - 1, 1, 0, 0, 0);
  const fin = new Date(year, monthIndex, 0, 23, 59, 59);
  return { debut: debut.toISOString(), fin: fin.toISOString() };
}

export default function CalendrierPage() {
  const defaultMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(defaultMonth);
  const [evenements, setEvenements] = useState<EvenementResponse[]>([]);

  useEffect(() => {
    const { debut, fin } = getMonthRange(month);
    evenementService.getCalendrier(debut, fin).then(setEvenements).catch(() => {
      evenementService.getAll().then(setEvenements).catch(() => {});
    });
  }, [month]);

  const grouped = useMemo(() => {
    return evenements.reduce<Record<string, EvenementResponse[]>>((acc, event) => {
      const day = event.dateDebut.slice(0, 10);
      acc[day] = [...(acc[day] || []), event];
      return acc;
    }, {});
  }, [evenements]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Calendrier</h1>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded-lg px-3 py-2" />
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([day, items]) => (
          <Card key={day}>
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={20} className="text-primary" />
              <h2 className="font-semibold">{new Date(day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
            </div>
            <div className="space-y-3">
              {items.map((event) => (
                <div key={event.id} className="border-l-4 border-primary pl-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800">{event.titre}</p>
                    <Badge className={getStatutColor(event.statut)}>{event.statut}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{formatDateTime(event.dateDebut)}</p>
                  {event.lieu && <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} /> {event.lieu}</p>}
                </div>
              ))}
            </div>
          </Card>
        ))}
        {evenements.length === 0 && <p className="text-center text-gray-400 py-8">Aucun evenement pour ce mois</p>}
      </div>
    </div>
  );
}
