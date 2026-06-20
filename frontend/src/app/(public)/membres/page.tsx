'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor } from '@/lib/utils';
import { membreService } from '@/services/membre.service';
import { mandatService } from '@/services/mandat.service';
import { equipeService } from '@/services/equipe.service';
import { MembreResponse, Mandat } from '@/types';
import { Avatar } from '@/components/ui/Avatar';

function RoleCard({ membre, role, chefDe, equipe }: { membre: MembreResponse; role: string; chefDe?: string; equipe?: string }) {
  return (
    <Link href={`/membres/${membre.id}`}>
      <Card className="flex flex-col items-center gap-3 p-6 hover:shadow-md transition-shadow text-center h-full">
        <Avatar photo={membre.photo} nom={membre.nom} prenom={membre.prenom} size={72} />
        <div>
          <p className="font-semibold text-base">{membre.prenom} {membre.nom}</p>
          <p className="text-sm font-medium text-primary mt-1">{role}</p>
          {chefDe
            ? <p className="text-xs text-blue-600 font-medium mt-1">Chef d&apos;équipe de: {chefDe}</p>
            : equipe && <p className="text-xs text-emerald-600 font-medium mt-1">Équipe: {equipe}</p>
          }
          <Badge className={`mt-2 ${getStatutColor(membre.statut)}`}>{membre.statut}</Badge>
        </div>
      </Card>
    </Link>
  );
}

export default function PublicMembresPage() {
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [mandat, setMandat] = useState<Mandat | null>(null);
  const [chefEquipeMap, setChefEquipeMap] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    membreService.getAll().then(setMembres).catch(() => {});
    mandatService.getActif().then(setMandat).catch(() => {});
    equipeService.getAll().then((equipes) => {
      const map = new Map<number, string>();
      equipes.forEach((eq) => {
        if (eq.chefEquipe?.id) map.set(eq.chefEquipe.id, eq.nom);
      });
      setChefEquipeMap(map);
    }).catch(() => {});
  }, []);

  const membresMap = new Map<number, MembreResponse>(membres.map((m) => [m.id, m]));

  const directionIds = new Set<number>();
  if (mandat?.directeur) directionIds.add(mandat.directeur.id);
  if (mandat?.viceDirecteur) directionIds.add(mandat.viceDirecteur.id);

  // Chefs d'équipe: exclude directeur & vice-directeur (they appear in Direction section)
  const chefsMembres = membres.filter(
    (m) => chefEquipeMap.has(m.id) && !directionIds.has(m.id)
  );

  // Exclude direction + chefs from "Tous les Membres"
  const autresMembres = membres.filter((m) => !directionIds.has(m.id) && !chefEquipeMap.has(m.id));

  const hasDirection = mandat && (mandat.directeur || mandat.viceDirecteur);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-blue-200 hover:text-white text-sm">← Retour à l&apos;accueil</Link>
          <h1 className="text-3xl font-heading font-bold mt-2">Nos Membres</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">

        {/* Direction : Directeur & Vice-Directeur */}
        {hasDirection && (
          <section>
            <h2 className="text-xl font-heading font-bold text-gray-800 mb-4 border-b pb-2">
              Direction du Laboratoire
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              {mandat.directeur && (
                <RoleCard
                  membre={mandat.directeur}
                  role="Directeur"
                  chefDe={chefEquipeMap.get(mandat.directeur.id)}
                  equipe={membresMap.get(mandat.directeur.id)?.equipeActuelle}
                />
              )}
              {mandat.viceDirecteur && (
                <RoleCard
                  membre={mandat.viceDirecteur}
                  role="Vice-Directeur"
                  chefDe={chefEquipeMap.get(mandat.viceDirecteur.id)}
                  equipe={membresMap.get(mandat.viceDirecteur.id)?.equipeActuelle}
                />
              )}
            </div>
          </section>
        )}

        {/* Chefs d'Équipe */}
        {chefsMembres.length > 0 && (
          <section>
            <h2 className="text-xl font-heading font-bold text-gray-800 mb-4 border-b pb-2">
              Chefs d&apos;Équipe
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {chefsMembres.map((chef) => (
                <RoleCard
                  key={chef.id}
                  membre={chef}
                  role="Chef d'Équipe"
                  equipe={chefEquipeMap.get(chef.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tous les Membres */}
        <section>
          <h2 className="text-xl font-heading font-bold text-gray-800 mb-4 border-b pb-2">
            Tous les Membres
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {autresMembres.map((m) => (
              <Link key={m.id} href={`/membres/${m.id}`}>
                <Card className="flex items-center gap-4 p-4 hover:shadow-md transition-shadow">
                  <Avatar photo={m.photo} nom={m.nom} prenom={m.prenom} size={56} />
                  <div>
                    <p className="font-semibold">{m.prenom} {m.nom}</p>
                    <Badge className={`mt-1 ${getStatutColor(m.statut)}`}>{m.statut}</Badge>
                    {m.equipeActuelle && (
                      <p className="text-xs text-gray-500 mt-1">Équipe: {m.equipeActuelle}</p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
