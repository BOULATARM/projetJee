'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import { membreService } from '@/services/membre.service';
import { MembreDetail } from '@/types';
import { ArrowLeft, Mail, Calendar, Building, BookOpen } from 'lucide-react';

export default function PublicMembreDetailPage() {
  const { id } = useParams();
  const [profil, setProfil] = useState<MembreDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      membreService.getById(Number(id))
        .then(setProfil)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Chargement...</p>
    </div>
  );

  if (!profil) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 text-lg">Membre introuvable</p>
        <Link href="/membres" className="text-primary hover:underline mt-2 block">← Retour aux membres</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-white font-heading font-bold text-xl">LIAS</Link>
          <span className="text-blue-300">/</span>
          <Link href="/membres" className="text-blue-200 hover:text-white text-sm">Membres</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/membres" className="flex items-center gap-2 text-primary mb-6 hover:underline text-sm">
          <ArrowLeft size={18} /> Retour aux membres
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 text-center">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {profil.prenom[0]}{profil.nom[0]}
            </div>
            <h1 className="text-xl font-bold text-gray-800">{profil.prenom} {profil.nom}</h1>
            <div className="flex justify-center gap-2 mt-2 flex-wrap">
              <Badge className={getStatutColor(profil.statut)}>{profil.statut}</Badge>
            </div>
            <div className="mt-4 text-sm text-gray-500 space-y-2">
              <div className="flex items-center justify-center gap-2"><Mail size={15} /> {profil.email}</div>
              {profil.dateEmbauche && (
                <div className="flex items-center justify-center gap-2">
                  <Calendar size={15} /> Depuis {formatDate(profil.dateEmbauche)}
                </div>
              )}
              {profil.etablissementOrigine && (
                <div className="flex items-center justify-center gap-2">
                  <Building size={15} /> {profil.etablissementOrigine}
                </div>
              )}
            </div>
          </Card>

          <div className="md:col-span-2 space-y-4">
            {profil.biographie && (
              <Card>
                <h2 className="font-semibold mb-2 text-gray-700">Biographie</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{profil.biographie}</p>
                {profil.centresInteret && (
                  <>
                    <h3 className="font-semibold mt-4 mb-1 text-gray-700 text-sm">Centres d&apos;intérêt</h3>
                    <p className="text-gray-600 text-sm">{profil.centresInteret}</p>
                  </>
                )}
              </Card>
            )}

            {profil.affiliations.some(a => a.actif) && (
              <Card>
                <h2 className="font-semibold mb-3 text-gray-700">Équipe(s)</h2>
                <div className="space-y-2">
                  {profil.affiliations.filter(a => a.actif).map(a => (
                    <div key={a.id} className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      <p className="text-sm font-medium">{a.equipeNom}</p>
                      <Badge className="bg-green-100 text-green-800 text-xs">Actif</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {profil.publications.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-primary" />
                  <h2 className="font-semibold text-gray-700">Publications ({profil.publications.length})</h2>
                </div>
                <div className="space-y-2">
                  {profil.publications.map(p => (
                    <div key={p.id} className="text-sm p-2 bg-gray-50 rounded">
                      <p className="font-medium text-gray-800">{p.titre}</p>
                      <span className="text-gray-500">{p.annee} • {p.type}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-primary text-white text-center py-4 mt-8">
        <p className="text-sm">© 2025 LIAS - Faculté des Sciences Ben M&apos;Sik, Casablanca, Maroc</p>
      </footer>
    </div>
  );
}
