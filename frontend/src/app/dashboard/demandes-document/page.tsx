'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Check, X, Clock, FileText } from 'lucide-react';

type StatutDemande = 'PENDING' | 'ACCEPTEE' | 'REFUSEE';

interface DemandeDocument {
  id: number;
  titre: string;
  description?: string;
  typeDocument?: string;
  statut: StatutDemande;
  motifRefus?: string;
  dateCreation: string;
  dateTraitement?: string;
  demandeur?: { id: number; prenom: string; nom: string; email: string };
  traitePar?: { id: number; prenom: string; nom: string };
}

const STATUT_STYLE: Record<StatutDemande, string> = {
  PENDING:  'bg-yellow-100 text-yellow-800',
  ACCEPTEE: 'bg-green-100 text-green-800',
  REFUSEE:  'bg-red-100 text-red-800',
};
const STATUT_LABEL: Record<StatutDemande, string> = {
  PENDING:  'En attente',
  ACCEPTEE: 'Acceptée',
  REFUSEE:  'Refusée',
};

export default function DemandesDocumentPage() {
  const [demandes, setDemandes] = useState<DemandeDocument[]>([]);
  const [filter, setFilter] = useState<string>('PENDING');
  const [refusModal, setRefusModal] = useState<{ id: number } | null>(null);
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get('/demandes-document').then(r => setDemandes(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleAccepter = async (id: number) => {
    setLoading(true);
    try {
      await api.put(`/demandes-document/${id}/accepter`);
      load();
    } finally { setLoading(false); }
  };

  const handleRefuser = async () => {
    if (!refusModal) return;
    setLoading(true);
    try {
      await api.put(`/demandes-document/${refusModal.id}/refuser`, null, {
        params: { motif: motif || undefined },
      });
      setRefusModal(null);
      setMotif('');
      load();
    } finally { setLoading(false); }
  };

  const filtered = filter ? demandes.filter(d => d.statut === filter) : demandes;
  const pendingCount = demandes.filter(d => d.statut === 'PENDING').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800 flex items-center gap-2">
          <FileText size={24} /> Demandes de documents
        </h1>
        {pendingCount > 0 && (
          <Badge className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1">
            {pendingCount} en attente
          </Badge>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {['', 'PENDING', 'ACCEPTEE', 'REFUSEE'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s === '' ? 'Toutes' : STATUT_LABEL[s as StatutDemande]}
            {s === 'PENDING' && pendingCount > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-1.5">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-4">
        {filtered.map(d => (
          <Card key={d.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h3 className="font-semibold text-gray-800">{d.titre}</h3>
                  <Badge className={STATUT_STYLE[d.statut]}>{STATUT_LABEL[d.statut]}</Badge>
                  {d.typeDocument && (
                    <Badge className="bg-gray-100 text-gray-600 text-xs">{d.typeDocument}</Badge>
                  )}
                </div>
                {d.description && <p className="text-sm text-gray-500 mb-2">{d.description}</p>}
                <div className="text-xs text-gray-400 space-y-0.5">
                  {d.demandeur && (
                    <p>Par : <span className="font-medium text-gray-600">{d.demandeur.prenom} {d.demandeur.nom}</span> — {d.demandeur.email}</p>
                  )}
                  <p className="flex items-center gap-1"><Clock size={12} /> {formatDateTime(d.dateCreation)}</p>
                  {d.statut !== 'PENDING' && d.traitePar && (
                    <p>Traité par : {d.traitePar.prenom} {d.traitePar.nom} le {formatDateTime(d.dateTraitement || '')}</p>
                  )}
                  {d.statut === 'REFUSEE' && d.motifRefus && (
                    <p className="text-red-500 mt-1">Motif : {d.motifRefus}</p>
                  )}
                </div>
              </div>

              {d.statut === 'PENDING' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAccepter(d.id)}
                    disabled={loading}
                    className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    <Check size={14} /> Accepter
                  </button>
                  <button
                    onClick={() => { setRefusModal({ id: d.id }); setMotif(''); }}
                    disabled={loading}
                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    <X size={14} /> Refuser
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-10">Aucune demande {filter ? STATUT_LABEL[filter as StatutDemande].toLowerCase() : ''}</p>
        )}
      </div>

      {/* Modal refus */}
      {refusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <X size={18} className="text-red-500" /> Refuser la demande
            </h3>
            <textarea
              rows={3}
              value={motif}
              onChange={e => setMotif(e.target.value)}
              placeholder="Motif du refus (optionnel)"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 outline-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setRefusModal(null); setMotif(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleRefuser}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
