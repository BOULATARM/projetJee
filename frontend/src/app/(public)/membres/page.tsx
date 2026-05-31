'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor } from '@/lib/utils';
import { membreService } from '@/services/membre.service';
import { MembreResponse } from '@/types';

export default function PublicMembresPage() {
  const [membres, setMembres] = useState<MembreResponse[]>([]);

  useEffect(() => {
    membreService.getAll().then(setMembres).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-blue-200 hover:text-white text-sm">← Retour à l&apos;accueil</Link>
          <h1 className="text-3xl font-heading font-bold mt-2">Nos Membres</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {membres.map((m) => (
            <Link key={m.id} href={`/membres/${m.id}`}>
              <Card className="flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {m.prenom[0]}{m.nom[0]}
                </div>
                <div>
                  <p className="font-semibold">{m.prenom} {m.nom}</p>
                  <Badge className={getStatutColor(m.statut)}>{m.statut}</Badge>
                  {m.equipeActuelle && <p className="text-xs text-gray-500 mt-1">{m.equipeActuelle}</p>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
