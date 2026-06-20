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
import { equipeService } from '@/services/equipe.service';
import { DashboardStats, MembreResponse, PublicationResponse, EvenementResponse, Equipe, Laboratoire } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { laboratoireService } from '@/services/laboratoire.service';

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [publications, setPublications] = useState<PublicationResponse[]>([]);
  const [evenements, setEvenements] = useState<EvenementResponse[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [equipesLoaded, setEquipesLoaded] = useState(false);
  const [labo, setLabo] = useState<Laboratoire | null>(null);

  useEffect(() => {
    Promise.allSettled([
      statsService.getDashboard(),
      membreService.getAll(),
      publicationService.getAll(),
      evenementService.getAll(),
      equipeService.getAll(),
      laboratoireService.get(),
    ]).then(([s, m, p, e, eq, l]) => {
      if (s.status === 'fulfilled') setStats(s.value);
      if (m.status === 'fulfilled') setMembres(m.value);
      if (p.status === 'fulfilled') setPublications(p.value);
      if (e.status === 'fulfilled') setEvenements(e.value);
      if (eq.status === 'fulfilled') setEquipes(eq.value);
      if (l.status === 'fulfilled') setLabo(l.value);
      setEquipesLoaded(true);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-bold">{labo?.acronyme ?? 'LIAS'}</h1>
            <p className="text-blue-200">{labo?.nom ?? 'Laboratoire d\'Informatique et d\'Applications Scientifiques'}</p>
          </div>
          <nav className="flex items-center gap-3 flex-wrap">
            <Link href="/membres" className="text-white hover:text-blue-200 text-sm">Membres</Link>
            <Link href="/equipes" className="text-white hover:text-blue-200 text-sm">Équipes</Link>
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
            {labo ? (
              <>
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
                  {labo.acronyme && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">{labo.acronyme}</span>
                  )}
                  {labo.dateCreation && (
                    <span>Fondé le {new Date(labo.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  )}
                  {labo.adresse && (
                    <span>{labo.adresse}</span>
                  )}
                </div>
                <p className="mb-4">{labo.description}</p>
                {labo.axesDeRecherche && (
                  <p>
                    <span className="font-medium text-gray-700">Axes de recherche : </span>
                    {labo.axesDeRecherche}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-400">Chargement...</p>
            )}
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
                    <Avatar photo={m.photo} nom={m.nom} prenom={m.prenom} size={40} />
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
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-900">{p.titre}</p>
                    <a
                      href={`http://localhost:8080/api/v1/publications/${p.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 text-xs text-red-600 hover:text-red-800 border border-red-200 rounded px-2 py-0.5 hover:bg-red-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                      PDF
                    </a>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {p.auteurs && p.auteurs.length > 0
                      ? p.auteurs.map(a => `${a.prenom} ${a.nom}`).join(', ')
                      : <span className="italic">Auteurs non spécifiés</span>
                    } • {p.annee}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold text-primary">Nos Équipes</h2>
            <Link href="/equipes" className="text-primary hover:underline text-sm">Voir toutes les équipes →</Link>
          </div>
          {!equipesLoaded ? (
            <p className="text-sm text-gray-400">Chargement...</p>
          ) : equipes.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune équipe disponible.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {equipes.slice(0, 3).map((eq) => (
                <Link key={eq.id} href={`/equipes/${eq.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full p-5 flex flex-col gap-2">
                    <h3 className="font-bold text-gray-900">{eq.nom}</h3>
                    {eq.axeRecherche && (
                      <p className="text-xs text-blue-600 font-medium">{eq.axeRecherche}</p>
                    )}
                    {eq.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 flex-1">{eq.description}</p>
                    )}
                    {eq.chefEquipe && (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar photo={eq.chefEquipe.photo} nom={eq.chefEquipe.nom} prenom={eq.chefEquipe.prenom} size={24} />
                        <p className="text-xs text-gray-500">{eq.chefEquipe.prenom} {eq.chefEquipe.nom}</p>
                      </div>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

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
