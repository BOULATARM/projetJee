"use client";
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { publicationService } from '@/services/publication.service';
import { PublicationResponse } from '@/types';
import api from '@/lib/api';
import { UserX, FileText, RefreshCw } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '');

export default function DashboardAncien() {
  const { membreId, nom, prenom } = useAuthStore();
  const [publications, setPublications] = useState<PublicationResponse[]>([]);
  const [demandeSent, setDemandeSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (membreId) {
      publicationService.getByMembre(membreId).then(setPublications).catch(() => {});
    }
  }, [membreId]);

  const demanderReactivation = async () => {
    setSending(true);
    try {
      await api.post('/membres/reactivation');
      setDemandeSent(true);
    } catch { setDemandeSent(true); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-6">
      <Card className="text-center border-2 border-red-200 bg-red-50">
        <UserX size={48} className="text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-heading font-bold text-gray-800 mb-2">Compte désactivé</h2>
        <p className="text-gray-600 text-sm">
          Vous n&apos;êtes plus membre actif du laboratoire LIAS.<br />
          Votre historique et vos publications sont conservés.
        </p>
        <div className="mt-4">
          {demandeSent ? (
            <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
              <RefreshCw size={18} />
              Votre demande de réactivation a été envoyée au directeur.
            </div>
          ) : (
            <button onClick={demanderReactivation} disabled={sending}
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 mx-auto">
              <RefreshCw size={16} />
              {sending ? 'Envoi...' : 'Demander la réactivation'}
            </button>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="font-heading font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FileText size={18} /> Mes publications historiques ({publications.length})
        </h2>
        {publications.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune publication enregistrée.</p>
        ) : (
          <div className="space-y-3">
            {publications.map(p => (
              <div key={p.id} className="p-3 bg-gray-50 rounded-lg flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{p.titre}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-700 text-xs">{p.typePub}</Badge>
                    <span className="text-xs text-gray-500">{p.annee}</span>
                  </div>
                </div>
                {p.fichierPath && (
                  <a href={`${API_BASE}/api/v1/publications/${p.id}/download`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs shrink-0">
                    📄 PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
      <p className="text-xs text-center text-gray-400">Connecté en tant que {prenom} {nom} · Compte désactivé</p>
    </div>
  );
}
