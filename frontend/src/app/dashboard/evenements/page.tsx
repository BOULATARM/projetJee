'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import { evenementService } from '@/services/evenement.service';
import { EvenementResponse } from '@/types';
import { CalendarDays, MapPin } from 'lucide-react';

export default function EvenementsPage() {
  const [evenements, setEvenements] = useState<EvenementResponse[]>([]);

  useEffect(() => {
    evenementService.getAll().then(setEvenements).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Événements</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evenements.map((e) => (
          <Card key={e.id}>
            <div className="flex justify-between items-start mb-3">
              <Badge className={getStatutColor(e.statut)}>{e.statut}</Badge>
              <Badge className="bg-purple-100 text-purple-800">{e.type}</Badge>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{e.titre}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{e.description}</p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} />
                <span>{formatDate(e.dateDebut)}</span>
              </div>
              {e.lieu && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{e.lieu}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
