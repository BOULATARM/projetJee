'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import { statsService } from '@/services/stats.service';
import { evenementService } from '@/services/evenement.service';
import { publicationService } from '@/services/publication.service';
import { DashboardStats, EvenementResponse, PublicationResponse } from '@/types';
import { Users, BookOpen, Calendar, GraduationCap, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [evenements, setEvenements] = useState<EvenementResponse[]>([]);
  const [publications, setPublications] = useState<PublicationResponse[]>([]);

  useEffect(() => {
    statsService.getDashboard().then(setStats).catch(() => {});
    evenementService.getAll().then(setEvenements).catch(() => {});
    publicationService.getAll().then(setPublications).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Membres', value: stats?.nbMembres || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Publications', value: stats?.nbPublications || 0, icon: BookOpen, color: 'bg-green-500' },
    { label: 'Événements', value: stats?.nbEvenements || 0, icon: Calendar, color: 'bg-purple-500' },
    { label: 'Équipes', value: stats?.nbEquipes || 0, icon: GraduationCap, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Card key={card.label} className="flex items-center gap-4">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon size={24} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold">Prochains événements</h2>
            <Link href="/dashboard/evenements" className="text-primary text-sm flex items-center gap-1">
              Voir tout <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {evenements.filter(e => e.statut === 'PLANIFIE').slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{e.titre}</p>
                  <p className="text-xs text-gray-500">{formatDate(e.dateDebut)}</p>
                </div>
                <Badge className={getStatutColor(e.statut)}>{e.statut}</Badge>
              </div>
            ))}
            {evenements.filter(e => e.statut === 'PLANIFIE').length === 0 && (
              <p className="text-sm text-gray-400">Aucun événement planifié</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold">Dernières publications</h2>
            <Link href="/dashboard/publications" className="text-primary text-sm flex items-center gap-1">
              Voir tout <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {publications.slice(0, 5).map((p) => (
              <div key={p.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{p.titre}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-800 text-xs">{p.typePub}</Badge>
                  <span className="text-xs text-gray-500">{p.annee}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
