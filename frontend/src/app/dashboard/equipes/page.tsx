'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { Equipe } from '@/types';
import { GraduationCap } from 'lucide-react';

export default function EquipesPage() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);

  useEffect(() => {
    api.get('/equipes').then(res => setEquipes(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Équipes de recherche</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {equipes.map((eq) => (
          <Card key={eq.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary rounded-lg">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold">{eq.nom}</h2>
                {eq.chefEquipe && (
                  <p className="text-sm text-gray-500">Chef: {eq.chefEquipe.prenom} {eq.chefEquipe.nom}</p>
                )}
              </div>
            </div>
            {eq.description && <p className="text-sm text-gray-600 mb-3">{eq.description}</p>}
            {eq.axeRecherche && (
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">{eq.axeRecherche}</Badge>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
