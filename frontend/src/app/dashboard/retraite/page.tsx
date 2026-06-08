"use client";
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { publicationService } from '@/services/publication.service';
import { PublicationResponse } from '@/types';
import { Lock, BookOpen, FileText } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '');

export default function DashboardRetraite() {
  const { membreId, nom, prenom } = useAuthStore();
  const [publications, setPublications] = useState<PublicationResponse[]>([]);

  useEffect(() => {
    if (membreId) {
      publicationService.getByMembre(membreId).then(setPublications).catch(() => {});
    }
  }, [membreId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-300 rounded-xl px-5 py-4">
        <Lock size={20} className="text-yellow-600 shrink-0" />
        <div>
          <p className="font-semibold text-yellow-800">Compte gelé — consultation uniquement</p>
          <p className="text-sm text-yellow-700">Aucune modification n&apos;est possible. Contactez l&apos;administrateur pour toute demande.</p>
        </div>
      </div>

      <Card>
        <h2 className="font-heading font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <BookOpen size={18} /> Profil
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {prenom?.[0]}{nom?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{prenom} {nom}</p>
            <Badge className="bg-orange-100 text-orange-700 text-xs mt-1">RETRAITÉ</Badge>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Les informations de profil sont en lecture seule.</p>
      </Card>

      <Card>
        <h2 className="font-heading font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FileText size={18} /> Mes publications ({publications.length})
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
    </div>
  );
}
