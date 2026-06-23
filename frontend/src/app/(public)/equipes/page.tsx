'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { equipeService } from '@/services/equipe.service';
import { Equipe } from '@/types';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { useT } from '@/hooks/useT';

export default function PublicEquipesPage() {
  const t = useT();
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    equipeService.getAll().then(setEquipes).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-stone-900">
      <PublicHeader title={t.pub.equipesTitle} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-gray-500 dark:text-stone-400">{t.pub.loading}</p>
        ) : equipes.length === 0 ? (
          <p className="text-gray-500 dark:text-stone-400">{t.pub.noEquipes}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipes.map((eq) => (
              <Link key={eq.id} href={`/equipes/${eq.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col gap-3 p-6">
                  <h2 className="text-lg font-bold text-primary">{eq.nom}</h2>
                  {eq.axeRecherche && (
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">{eq.axeRecherche}</p>
                  )}
                  {eq.description && (
                    <p className="text-sm text-gray-600 dark:text-stone-400 flex-1 line-clamp-3">{eq.description}</p>
                  )}
                  {eq.chefEquipe && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-stone-700">
                      <Avatar photo={eq.chefEquipe.photo} nom={eq.chefEquipe.nom} prenom={eq.chefEquipe.prenom} size={32} />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-stone-400">{t.pub.teamLeaderSmall}</p>
                        <p className="text-sm font-medium">{eq.chefEquipe.prenom} {eq.chefEquipe.nom}</p>
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-primary text-white text-center py-6 mt-12">
        <p className="text-sm">{t.pub.footer}</p>
      </footer>
    </div>
  );
}
