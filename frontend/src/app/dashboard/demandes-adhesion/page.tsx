'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import { DemandeAdhesion, StatutDemande } from '@/types';
import { CheckCircle, XCircle } from 'lucide-react';

export default function DemandesAdhesionPage() {
  const [demandes, setDemandes] = useState<DemandeAdhesion[]>([]);

  useEffect(() => {
    api.get('/demandes-adhesion').then(res => setDemandes(res.data)).catch(() => {});
  }, []);

  const handleAccepter = async (id: number) => {
    try {
      await api.put(`/demandes-adhesion/${id}/accepter`);
      setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: StatutDemande.ACCEPTEE } : d));
    } catch {}
  };

  const handleRefuser = async (id: number) => {
    try {
      await api.put(`/demandes-adhesion/${id}/refuser`);
      setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: StatutDemande.REFUSEE } : d));
    } catch {}
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Demandes d&apos;adhésion</h1>

      <div className="space-y-4">
        {demandes.map((d) => (
          <Card key={d.id}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {d.prenom[0]}{d.nom[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{d.prenom} {d.nom}</p>
                    <p className="text-sm text-gray-500">{d.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Badge className={getStatutColor(d.statut)}>{d.statut}</Badge>
                  <Badge className="bg-gray-100 text-gray-600">{d.typeMembreDemande}</Badge>
                  <span className="text-xs text-gray-400">{formatDate(d.dateDepot)}</span>
                </div>
                {d.motivation && (
                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">{d.motivation}</p>
                )}
                {d.commentaireRefus && (
                  <p className="mt-2 text-sm text-red-600">Refus: {d.commentaireRefus}</p>
                )}
              </div>
              {d.statut === StatutDemande.PENDING && (
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleAccepter(d.id)}
                    className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600">
                    <CheckCircle size={20} />
                  </button>
                  <button onClick={() => handleRefuser(d.id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600">
                    <XCircle size={20} />
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
        {demandes.length === 0 && (
          <p className="text-gray-400 text-center py-8">Aucune demande d&apos;adhésion</p>
        )}
      </div>
    </div>
  );
}
