'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import { membreService } from '@/services/membre.service';
import { useAuthStore } from '@/store/authStore';
import { MembreDetail } from '@/types';
import { Mail, Calendar, Building, BookOpen } from 'lucide-react';

export default function ProfilPage() {
  const { membreId } = useAuthStore();
  const [profil, setProfil] = useState<MembreDetail | null>(null);

  useEffect(() => {
    if (membreId) {
      membreService.getById(membreId).then(setProfil).catch(() => {});
    }
  }, [membreId]);

  if (!profil) return <div className="text-gray-500">Chargement...</div>;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Mon Profil</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 text-center">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            {profil.prenom[0]}{profil.nom[0]}
          </div>
          <h2 className="text-xl font-bold">{profil.prenom} {profil.nom}</h2>
          <div className="flex justify-center gap-2 mt-2">
            <Badge className={getStatutColor(profil.statut)}>{profil.statut}</Badge>
            <Badge className="bg-primary text-white">{profil.systemRole}</Badge>
          </div>
          <div className="mt-4 text-sm text-gray-500 space-y-2">
            <div className="flex items-center justify-center gap-2"><Mail size={16} /> {profil.email}</div>
            {profil.dateEmbauche && <div className="flex items-center justify-center gap-2"><Calendar size={16} /> Depuis {formatDate(profil.dateEmbauche)}</div>}
            {profil.etablissementOrigine && <div className="flex items-center justify-center gap-2"><Building size={16} /> {profil.etablissementOrigine}</div>}
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {profil.biographie && (
            <Card>
              <h3 className="font-semibold mb-2">Biographie</h3>
              <p className="text-gray-600 text-sm">{profil.biographie}</p>
            </Card>
          )}

          <Card>
            <h3 className="font-semibold mb-3">Affiliations</h3>
            <div className="space-y-2">
              {profil.affiliations.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{a.equipeNom}</p>
                    <p className="text-xs text-gray-500">{formatDate(a.dateDebut)}{a.dateFin ? ` - ${formatDate(a.dateFin)}` : ' - Présent'}</p>
                  </div>
                  {a.actif ? <Badge className="bg-green-100 text-green-800">Actif</Badge> : <Badge className="bg-gray-100 text-gray-600">Inactif</Badge>}
                </div>
              ))}
            </div>
          </Card>

          {profil.publications.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} />
                <h3 className="font-semibold">Publications ({profil.publications.length})</h3>
              </div>
              <div className="space-y-2">
                {profil.publications.map(p => (
                  <div key={p.id} className="text-sm p-2 bg-gray-50 rounded">
                    <p className="font-medium">{p.titre}</p>
                    <span className="text-gray-500">{p.annee} • {p.type}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
