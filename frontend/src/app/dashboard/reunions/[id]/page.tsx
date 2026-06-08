'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDateTime } from '@/lib/utils';
import { Reunion, MembreResponse, Document, RoleSysteme } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Download, FileText, MapPin, Upload, UserPlus, UserMinus } from 'lucide-react';
import api from '@/lib/api';
import { membreService } from '@/services/membre.service';
import { toArray } from '@/lib/normalize';

export default function ReunionDetailPage() {
  const { id } = useParams();
  const [reunion, setReunion] = useState<Reunion | null>(null);
  const [participants, setParticipants] = useState<MembreResponse[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [allMembres, setAllMembres] = useState<MembreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [compteRendu, setCompteRendu] = useState('');
  const [editingCR, setEditingCR] = useState(false);
  const [uploadingPV, setUploadingPV] = useState(false);
  const [addMembreId, setAddMembreId] = useState('');
  const { role } = useAuthStore();
  const canManage = role === RoleSysteme.ADMIN || role === RoleSysteme.DIRECTEUR;

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/reunions/${id}`);
      setReunion(res.data);
      setCompteRendu(res.data.compteRendu || '');
      // Load participants
      const partRes = await api.get(`/reunions/${id}/presences`).catch(() => ({ data: [] }));
      setParticipants(toArray(partRes.data));
      // Load documents linked to this reunion
      const docRes = await api.get('/documents', { params: { reunionId: id } }).catch(() => ({ data: [] }));
      setDocuments(toArray(docRes.data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    membreService.getAll().then(setAllMembres).catch(() => {});
  }, [id]);

  const handleSaveCR = async () => {
    if (!id) return;
    await api.put(`/reunions/${id}`, { compteRendu });
    setEditingCR(false);
    await load();
  };

  const handleUploadPV = async (file: File) => {
    if (!id) return;
    setUploadingPV(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post(`/reunions/${id}/pv`, fd);
      await load();
    } finally {
      setUploadingPV(false);
    }
  };

  const handleDownloadPV = async () => {
    if (!id) return;
    const res = await api.get(`/reunions/${id}/pv`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = window.document.createElement('a');
    a.href = url; a.download = `pv-reunion-${id}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDoc = async (doc: Document) => {
    const res = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = window.document.createElement('a');
    a.href = url; a.download = doc.nom; a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddParticipant = async () => {
    if (!id || !addMembreId) return;
    await api.post(`/reunions/${id}/presence/${addMembreId}`, null, { params: { present: true } });
    setAddMembreId('');
    await load();
  };

  const handleRemoveParticipant = async (membreId: number) => {
    if (!id) return;
    await api.delete(`/reunions/${id}/presence/${membreId}`).catch(() => {});
    await load();
  };

  if (loading) return <div className="text-gray-500 p-6">Chargement...</div>;
  if (!reunion) return <div className="text-red-500 p-6">Réunion introuvable.</div>;

  return (
    <div>
      <Link href="/dashboard/reunions" className="flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft size={20} /> Retour aux réunions
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-xl font-bold text-gray-800">{reunion.titre}</h1>
              <Badge className={getStatutColor(reunion.statut)}>{reunion.statut}</Badge>
            </div>
            <p className="text-sm text-gray-500">{formatDateTime(reunion.dateReunion)}</p>
            {reunion.lieu && (
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                <MapPin size={14} /> {reunion.lieu}
              </p>
            )}
            {(reunion.createur || reunion.creePar) && (
              <p className="text-xs text-gray-400 mt-3">
                Créée par {((reunion.createur || reunion.creePar) as MembreResponse)?.prenom} {((reunion.createur || reunion.creePar) as MembreResponse)?.nom}
              </p>
            )}

            {reunion.ordreJour && (
              <div className="mt-4 pt-3 border-t">
                <p className="text-sm font-medium text-gray-700 mb-1">Ordre du jour</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{reunion.ordreJour}</p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t flex gap-3 flex-wrap">
              <label className="flex items-center gap-1 text-sm text-primary cursor-pointer hover:underline">
                <Upload size={14} /> {uploadingPV ? 'Upload...' : 'Upload PV'}
                <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleUploadPV(e.target.files[0]); }} />
              </label>
              {reunion.pvPath && (
                <button onClick={handleDownloadPV} className="flex items-center gap-1 text-sm text-green-600 hover:underline">
                  <Download size={14} /> Télécharger PV
                </button>
              )}
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          {/* Compte rendu */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Compte rendu</h2>
              {!editingCR && (
                <button onClick={() => setEditingCR(true)} className="text-sm text-primary hover:underline">Modifier</button>
              )}
            </div>
            {editingCR ? (
              <div className="space-y-2">
                <textarea rows={6} value={compteRendu} onChange={e => setCompteRendu(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingCR(false)} className="px-3 py-1 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Annuler</button>
                  <button onClick={handleSaveCR} className="px-3 py-1 text-sm bg-primary text-white rounded-lg">Sauvegarder</button>
                </div>
              </div>
            ) : (
              reunion.compteRendu
                ? <p className="text-sm text-gray-600 whitespace-pre-wrap">{reunion.compteRendu}</p>
                : <p className="text-sm text-gray-400">Aucun compte rendu rédigé.</p>
            )}
          </Card>

          {/* Participants */}
          <Card>
            <h2 className="font-semibold mb-3">Participants ({participants.length})</h2>
            {canManage && (
              <div className="flex gap-2 mb-3">
                <select value={addMembreId} onChange={e => setAddMembreId(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Ajouter un participant...</option>
                  {allMembres.filter(m => !participants.some(p => p.id === m.id)).map(m => (
                    <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                  ))}
                </select>
                <button onClick={handleAddParticipant} disabled={!addMembreId}
                  className="bg-primary text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center gap-1">
                  <UserPlus size={16} />
                </button>
              </div>
            )}
            <div className="space-y-2">
              {participants.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <Link href={`/dashboard/membres/${p.id}`} className="flex items-center gap-2 hover:text-primary">
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {p.prenom[0]}{p.nom[0]}
                    </div>
                    <span className="text-sm">{p.prenom} {p.nom}</span>
                  </Link>
                  {canManage && (
                    <button onClick={() => handleRemoveParticipant(p.id)} className="text-red-400 hover:text-red-600 p-1">
                      <UserMinus size={14} />
                    </button>
                  )}
                </div>
              ))}
              {participants.length === 0 && <p className="text-sm text-gray-400">Aucun participant enregistré.</p>}
            </div>
          </Card>

          {/* Documents */}
          {documents.length > 0 && (
            <Card>
              <h2 className="font-semibold mb-3 flex items-center gap-2"><FileText size={16} /> Documents ({documents.length})</h2>
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{doc.nom}</p>
                      <Badge className="bg-gray-100 text-gray-600 text-xs">{doc.typeDocument}</Badge>
                    </div>
                    <button onClick={() => handleDownloadDoc(doc)} className="text-primary hover:underline text-sm flex items-center gap-1">
                      <Download size={14} /> Télécharger
                    </button>
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
