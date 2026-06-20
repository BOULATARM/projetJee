'use client';
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { documentService } from '@/services/document.service';
import { Document } from '@/types';
import { Upload, FileText, CheckCircle2, Clock, XCircle, Download, Trash2, X } from 'lucide-react';
import api from '@/lib/api';

const TYPES_DOC = [
  { value: 'RAPPORT',              label: 'Rapport' },
  { value: 'PUBLICATION',          label: 'Publication' },
  { value: 'ATTESTATION',          label: 'Attestation' },
  { value: 'DEMANDE_FINANCEMENT',  label: 'Demande de financement' },
  { value: 'ADMINISTRATIF',        label: 'Administratif' },
  { value: 'AUTRE',                label: 'Autre' },
];

function statutBadge(statut?: string) {
  if (statut === 'APPROUVE')
    return <Badge className="bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 size={12} /> Approuvé</Badge>;
  if (statut === 'REJETE')
    return <Badge className="bg-red-100 text-red-700 flex items-center gap-1"><XCircle size={12} /> Rejeté</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1"><Clock size={12} /> En attente</Badge>;
}

function fmtSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function MesDocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', description: '', typeDocument: 'RAPPORT' as string });
  const [fichier, setFichier] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    documentService.getMesDocuments()
      .then(setDocs)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fichier) return;
    setSending(true);
    try {
      await documentService.upload(fichier, {
        nom: form.nom || fichier.name,
        description: form.description,
        typeDocument: form.typeDocument,
      });
      setShowForm(false);
      setForm({ nom: '', description: '', typeDocument: 'RAPPORT' });
      setFichier(null);
      if (fileRef.current) fileRef.current.value = '';
      showToast('Document soumis — en attente de validation par le directeur.');
      load();
    } catch {
      showToast('Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await documentService.download(doc.id);
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.nom || 'document';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('Erreur lors du téléchargement.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce document ?')) return;
    try {
      await documentService.delete(id);
      showToast('Document supprimé.');
      load();
    } catch {
      showToast('Erreur lors de la suppression.');
    }
  };

  const pending  = docs.filter(d => d.statut === 'PENDING');
  const approuves = docs.filter(d => d.statut === 'APPROUVE');
  const rejetes  = docs.filter(d => d.statut === 'REJETE');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">Mes documents</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Soumettez vos documents — ils seront validés par le directeur avant publication.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          <Upload size={16} /> Soumettre un document
        </button>
      </div>

      {/* Bandeau info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-blue-700">
        <Clock size={16} className="mt-0.5 shrink-0" />
        <p>
          Chaque document soumis passe en <strong>attente de validation</strong> par le directeur.
          Une fois approuvé, il sera visible dans les documents du laboratoire.
        </p>
      </div>

      {/* Formulaire upload */}
      {showForm && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Nouveau document</h2>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
          </div>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fichier *</label>
              <input
                ref={fileRef}
                type="file"
                required
                onChange={e => setFichier(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-blue-700 file:cursor-pointer"
              />
              {fichier && (
                <p className="text-xs text-gray-400 mt-1">{fichier.name} — {fmtSize(fichier.size)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du document</label>
              <input
                type="text"
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
                placeholder="Laisser vide pour utiliser le nom du fichier"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.typeDocument}
                onChange={e => setForm({ ...form, typeDocument: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                {TYPES_DOC.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Description optionnelle..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button
                type="submit"
                disabled={sending || !fichier}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Upload size={15} /> {sending ? 'Envoi...' : 'Soumettre'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'En attente', count: pending.length, cls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Approuvés', count: approuves.length, cls: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Rejetés', count: rejetes.length, cls: 'bg-red-50 border-red-200 text-red-700' },
        ].map(({ label, count, cls }) => (
          <div key={label} className={`border rounded-xl p-4 text-center ${cls}`}>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Liste documents */}
      {loading ? (
        <p className="text-center text-gray-400 py-8">Chargement...</p>
      ) : docs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun document soumis. Cliquez sur "Soumettre un document" pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map(doc => (
            <Card key={doc.id}>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-gray-100 rounded-xl shrink-0">
                  <FileText size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-800">{doc.nom}</p>
                    {statutBadge(doc.statut)}
                    {doc.typeDocument && (
                      <Badge className="bg-gray-100 text-gray-500 text-xs">{doc.typeDocument}</Badge>
                    )}
                  </div>
                  {doc.description && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{doc.description}</p>
                  )}
                  {doc.statut === 'REJETE' && doc.motifRefus && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <XCircle size={12} /> Motif : {doc.motifRefus}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Soumis le {new Date(doc.dateUpload).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                    {doc.taille ? ` · ${fmtSize(doc.taille)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {doc.statut === 'APPROUVE' && (
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-primary"
                      title="Télécharger"
                    >
                      <Download size={16} />
                    </button>
                  )}
                  {doc.statut !== 'APPROUVE' && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
