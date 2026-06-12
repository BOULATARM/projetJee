'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { Check, X, Clock, FileText, Download, History } from 'lucide-react';
import api from '@/lib/api';
import { toArray } from '@/lib/normalize';
import { documentService } from '@/services/document.service';
import { Document } from '@/types';

const STATUT_STYLE: Record<string, string> = {
  PENDING:  'bg-yellow-100 text-yellow-800',
  APPROUVE: 'bg-green-100 text-green-800',
  REJETE:   'bg-red-100 text-red-800',
};
const STATUT_LABEL: Record<string, string> = {
  PENDING:  'En attente',
  APPROUVE: 'Approuvé',
  REJETE:   'Refusé',
};

export default function DocumentsApprobationPage() {
  const [pending, setPending] = useState<Document[]>([]);
  const [historique, setHistorique] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'historique'>('pending');
  const [motifRefus, setMotifRefus] = useState<Record<number, string>>({});
  const [showMotifFor, setShowMotifFor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    api.get('/documents/pending').then(r => setPending(toArray(r.data))).catch(() => {});
    api.get('/documents/historique').then(r => setHistorique(toArray(r.data))).catch(() => {});
  };

  useEffect(() => { loadData(); }, []);

  const handleApprouver = async (id: number) => {
    setLoading(true);
    try {
      await api.put(`/documents/${id}/approuver`);
      loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleRejeter = async (id: number) => {
    setLoading(true);
    try {
      await api.put(`/documents/${id}/rejeter`, { motifRefus: motifRefus[id] || '' });
      setShowMotifFor(null);
      setMotifRefus(prev => { const n = { ...prev }; delete n[id]; return n; });
      loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    const blob = await documentService.download(doc.id);
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = doc.nom;
    link.click();
    URL.revokeObjectURL(url);
  };

  const nonPending = historique.filter(d => d.statut !== 'PENDING');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Approbation des documents</h1>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <Badge className="bg-orange-100 text-orange-800">{pending.length} en attente</Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Clock size={16} /> En attente ({pending.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('historique')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'historique'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <History size={16} /> Historique ({nonPending.length})
          </span>
        </button>
      </div>

      {/* Documents en attente */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Clock size={40} className="mx-auto mb-3 opacity-40" />
              <p>Aucun document en attente d'approbation</p>
            </div>
          )}
          {pending.map(doc => (
            <Card key={doc.id} className="border-l-4 border-yellow-400">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-800">{doc.nom}</h3>
                    <Badge className="bg-gray-100 text-gray-700">{doc.typeDocument}</Badge>
                    <Badge className={STATUT_STYLE['PENDING']}>{STATUT_LABEL['PENDING']}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{doc.description || 'Sans description'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Soumis le {formatDateTime(doc.dateUpload)}
                    {doc.uploadePar && ` — Par ${doc.uploadePar.prenom} ${doc.uploadePar.nom}`}
                    {` — ${Math.ceil((doc.taille || 0) / 1024)} Ko`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    title="Prévisualiser / télécharger"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleApprouver(doc.id)}
                    disabled={loading}
                    className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check size={15} /> Approuver
                  </button>
                  <button
                    onClick={() => setShowMotifFor(showMotifFor === doc.id ? null : doc.id)}
                    disabled={loading}
                    className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    <X size={15} /> Refuser
                  </button>
                </div>
              </div>

              {/* Motif refus inline */}
              {showMotifFor === doc.id && (
                <div className="mt-3 pt-3 border-t flex gap-2">
                  <input
                    value={motifRefus[doc.id] || ''}
                    onChange={e => setMotifRefus(prev => ({ ...prev, [doc.id]: e.target.value }))}
                    placeholder="Motif du refus (facultatif)"
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-red-300 outline-none"
                  />
                  <button
                    onClick={() => handleRejeter(doc.id)}
                    disabled={loading}
                    className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    Confirmer le refus
                  </button>
                  <button
                    onClick={() => setShowMotifFor(null)}
                    className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Historique */}
      {activeTab === 'historique' && (
        <div className="space-y-3">
          {nonPending.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <History size={40} className="mx-auto mb-3 opacity-40" />
              <p>Aucun historique de décision</p>
            </div>
          )}
          {nonPending.map(doc => (
            <Card key={doc.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-800">{doc.nom}</h3>
                    <Badge className="bg-gray-100 text-gray-700">{doc.typeDocument}</Badge>
                    <Badge className={STATUT_STYLE[doc.statut || ''] || 'bg-gray-100 text-gray-600'}>
                      {STATUT_LABEL[doc.statut || ''] || doc.statut}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{doc.description || 'Sans description'}</p>
                  <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                    <p>
                      Soumis le {formatDateTime(doc.dateUpload)}
                      {doc.uploadePar && ` — Par ${doc.uploadePar.prenom} ${doc.uploadePar.nom}`}
                    </p>
                    {doc.dateDecision && (
                      <p>
                        Décision le {formatDateTime(doc.dateDecision)}
                        {doc.approuvePar && ` — Par ${doc.approuvePar.prenom} ${doc.approuvePar.nom}`}
                      </p>
                    )}
                    {doc.motifRefus && (
                      <p className="text-red-500">Motif de refus : {doc.motifRefus}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0"
                  title="Télécharger"
                >
                  <Download size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
