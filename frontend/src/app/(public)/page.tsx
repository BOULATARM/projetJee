'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import { statsService } from '@/services/stats.service';
import { membreService } from '@/services/membre.service';
import { publicationService } from '@/services/publication.service';
import { evenementService } from '@/services/evenement.service';
import { DashboardStats, MembreResponse, PublicationResponse, EvenementResponse } from '@/types';

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [publications, setPublications] = useState<PublicationResponse[]>([]);
  const [evenements, setEvenements] = useState<EvenementResponse[]>([]);

  useEffect(() => {
    statsService.getDashboard().then(setStats).catch(() => {});
    membreService.getAll().then(setMembres).catch(() => {});
    publicationService.getAll().then(setPublications).catch(() => {});
    evenementService.getAll().then(setEvenements).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-bold">LIAS</h1>
            <p className="text-blue-200">Laboratoire d&apos;Informatique et d&apos;Applications Scientifiques</p>
          </div>
          <nav className="flex items-center gap-3 flex-wrap">
            <Link href="/membres" className="text-white hover:text-blue-200 text-sm">Membres</Link>
            <Link href="/evenements" className="text-white hover:text-blue-200 text-sm">Événements</Link>
            <Link href="/publications" className="text-white hover:text-blue-200 text-sm">Publications</Link>
            <Link href="/auth/login" className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-blue-50">
              Connexion
            </Link>
            <Link href="/adhesion" className="bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700">
              Adhésion
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">À propos du laboratoire</h2>
          <Card className="text-gray-600 leading-relaxed">
            <p className="mb-4">
              Le Laboratoire d&apos;Informatique et d&apos;Applications Scientifiques (LIAS) est une unité de recherche
              de la Faculté des Sciences Ben M&apos;Sik, Université Hassan II de Casablanca. Il regroupe des chercheurs
              dans les domaines de l&apos;informatique et de ses applications scientifiques.
            </p>
            <p>
              Nos axes de recherche couvrent l&apos;Intelligence Artificielle, les Réseaux et Systèmes Distribués,
              ainsi que le Big Data et la Gestion des Connaissances.
            </p>
          </Card>
        </section>

        {stats && (
          <section className="mb-12">
            <h2 className="text-2xl font-heading font-bold text-primary mb-6">Chiffres clés</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.nbMembres}</p>
                <p className="text-sm text-gray-500 mt-1">Membres</p>
              </Card>
              <Card className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.nbPublications}</p>
                <p className="text-sm text-gray-500 mt-1">Publications</p>
              </Card>
              <Card className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.nbEvenements}</p>
                <p className="text-sm text-gray-500 mt-1">Événements</p>
              </Card>
              <Card className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.nbEquipes}</p>
                <p className="text-sm text-gray-500 mt-1">Équipes</p>
              </Card>
            </div>
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-4">Membres récents</h2>
            <div className="space-y-3">
              {membres.slice(0, 5).map((m) => (
                <Link key={m.id} href={`/membres/${m.id}`}>
                  <Card className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {m.prenom[0]}{m.nom[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{m.prenom} {m.nom}</p>
                      <Badge className={getStatutColor(m.statut)}>{m.statut}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
              {membres.length > 5 && (
                <Link href="/membres" className="text-primary hover:underline text-sm">Voir tous les membres →</Link>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-4">Dernières publications</h2>
            <div className="space-y-3">
              {publications.slice(0, 5).map((p) => (
                <Card key={p.id}>
                  <p className="font-medium text-gray-900">{p.titre}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {p.auteurs?.map(a => `${a.prenom} ${a.nom}`).join(', ')} • {p.annee}
                  </p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">{p.typePub}</Badge>
                </Card>
              ))}
              {publications.length > 5 && (
                <Link href="/publications" className="text-primary hover:underline text-sm">Voir toutes les publications →</Link>
              )}
            </div>
          </section>
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-heading font-bold text-primary mb-4">Prochains événements</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {evenements.filter(e => e.statut === 'PLANIFIE' || e.statut === 'EN_COURS').slice(0, 3).map((e) => (
              <Card key={e.id}>
                <Badge className={getStatutColor(e.statut)}>{e.statut}</Badge>
                <h3 className="font-bold text-lg mt-2">{e.titre}</h3>
                <p className="text-sm text-gray-500 mt-1">{formatDate(e.dateDebut)}</p>
                <p className="text-sm text-gray-500">{e.lieu}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white text-center py-6">
        <p className="text-sm">© 2025 LIAS - Faculté des Sciences Ben M&apos;Sik, Casablanca, Maroc</p>
      </footer>
    </div>
  );
}
