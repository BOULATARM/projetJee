'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { getStatutColor } from '@/lib/utils';
import { equipeService, EquipeDetail } from '@/services/equipe.service';
import { MembreResponse } from '@/types';

export default function PublicEquipeDetailPage() {
  const { id } = useParams();
  const [equipe, setEquipe] = useState<EquipeDetail | null>(null);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    Promise.all([
      equipeService.getById(numId),
      equipeService.getMembres(numId),
    ])
      .then(([eq, mbs]) => { setEquipe(eq); setMembres(mbs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Chargement...</p>
    </div>
  );

  if (!equipe) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Équipe introuvable.</p>
    </div>
  );

  const chef = equipe.chefEquipe;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/equipes" className="text-blue-200 hover:text-white text-sm">← Retour aux équipes</Link>
          <h1 className="text-3xl font-heading font-bold mt-2">{equipe.nom}</h1>
          {equipe.axeRecherche && (
            <p className="text-blue-200 mt-1 text-sm">{equipe.axeRecherche}</p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Info équipe */}
        <Card className="p-6 space-y-3">
          {equipe.description && (
            <p className="text-gray-600 leading-relaxed">{equipe.description}</p>
          )}
          {equipe.dateCreation && (
            <p className="text-sm text-gray-500">
              <span className="font-medium">Date de création :</span> {new Date(equipe.dateCreation).toLocaleDateString('fr-FR')}
            </p>
          )}
        </Card>

        {/* Chef d'équipe */}
        {chef && (
          <section>
            <h2 className="text-xl font-heading font-bold text-gray-800 mb-4 border-b pb-2">Chef d&apos;équipe</h2>
            <Link href={`/membres/${chef.id}`}>
              <Card className="flex items-center gap-4 p-4 hover:shadow-md transition-shadow max-w-sm">
                <Avatar photo={chef.photo} nom={chef.nom} prenom={chef.prenom} size={56} />
                <div>
                  <p className="font-semibold">{chef.prenom} {chef.nom}</p>
                  <Badge className={`mt-1 ${getStatutColor(chef.statut)}`}>{chef.statut}</Badge>
                </div>
              </Card>
            </Link>
          </section>
        )}

        {/* Membres */}
        <section>
          <h2 className="text-xl font-heading font-bold text-gray-800 mb-4 border-b pb-2">
            Membres <span className="text-gray-400 font-normal text-base">({membres.length})</span>
          </h2>
          {membres.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun membre dans cette équipe.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {membres.map((m) => (
                <Link key={m.id} href={`/membres/${m.id}`}>
                  <Card className="flex flex-col items-center gap-3 p-5 hover:shadow-md transition-shadow text-center h-full">
                    <Avatar photo={m.photo} nom={m.nom} prenom={m.prenom} size={56} />
                    <div>
                      <p className="font-semibold text-sm">{m.prenom} {m.nom}</p>
                      <Badge className={`mt-1 ${getStatutColor(m.statut)}`}>{m.statut}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-primary text-white text-center py-6 mt-12">
        <p className="text-sm">© 2025 LIAS - Faculté des Sciences Ben M&apos;Sik, Casablanca, Maroc</p>
      </footer>
    </div>
  );
}
