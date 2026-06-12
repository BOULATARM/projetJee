'use client';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { documentService } from '@/services/document.service';
import { Document, PublicationResponse, RoleSysteme } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Download, Search, Upload, BookOpen, FileText, X, Clock, Check, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { toArray } from '@/lib/normalize';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '');

const documentTypes = ['DEMANDE_FINANCEMENT', 'PROGRAMME', 'ATTESTATION', 'RAPPORT', 'ADMINISTRATIF', 'PV_REUNION', 'CONVENTION', 'AUTRE'];

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

export default function DocumentsPage() {
  const { role } = useAuthStore();
  const isDirecteur = role === RoleSysteme.DIRECTEUR;
  const isAdmin = role === RoleSysteme.ADMIN;
  const isPrivileged = isDirecteur || isAdmin;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [publications, setPublications] = useState<PublicationResponse[]>([]);
  const [mesDocuments, setMesDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Upload form
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ nom: '', description: '', typeDocument: 'AUTRE' });
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const loadDocuments = () => {
    documentService.getAll().then(setDocuments).catch(() => {});
  };

  const loadMesDocuments = () => {
    api.get('/documents/mes-documents').then(r => setMesDocuments(toArray(r.data))).catch(() => {});
  };

  useEffect(() => {
    loadDocuments();
    api.get('/publications').then(r => setPublications(toArray(r.data))).catch(() => {});
    if (!isPrivileged) loadMesDocuments();
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return documents.filter((doc) => {
      const matchText = !query || [doc.nom, doc.description, doc.typeDocument].some(v => v?.toLowerCase().includes(query));
      const matchType = !typeFilter || doc.typeDocument === typeFilter;
      return matchText && matchType;
    });
  }, [documents, search, typeFilter]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      await documentService.upload(file, form);
      setFile(null);
      setForm({ nom: '', description: '', typeDocument: 'AUTRE' });
      setShowUploadForm(false);
      if (isPrivileged) {
        loadDocuments();
        setUploadMsg('Document publié avec succès.');
      } else {
        loadMesDocuments();
        setUploadMsg('Document soumis. Il sera visible après approbation du directeur.');
      }
      setTimeout(() => setUploadMsg(''), 5000);
    } finally {
      setUploading(false);
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

  const pendingCount = mesDocuments.filter(d => d.statut === 'PENDING').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Documents</h1>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 text-blue-800">{documents.length} documents</Badge>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
          >
            {showUploadForm ? <X size={16} /> : <Upload size={16} />}
            {showUploadForm ? 'Annuler' : isPrivileged ? 'Ajouter un document' : 'Soumettre un document'}
          </button>
          {isDirecteur && (
            <Link
              href="/dashboard/documents-approbation"
              className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-orange-600"
            >
              <Clock size={16} /> Approbations
            </Link>
          )}
        </div>
      </div>

      {/* Message feedback */}
      {uploadMsg && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm border ${
          uploadMsg.includes('approbation')
            ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {uploadMsg.includes('approbation') ? <Clock size={16} /> : <Check size={16} />}
          {uploadMsg}
        </div>
      )}

      {/* Formulaire upload */}
      {showUploadForm && (
        <Card className="mb-6 border-l-4 border-primary">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FileText size={16} />
            {isPrivileged ? 'Publier un document' : 'Soumettre un document pour approbation'}
          </h2>
          {!isPrivileged && (
            <div className="mb-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-3 py-2 text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              Le document sera visible par tous après approbation du directeur.
            </div>
          )}
          <form onSubmit={handleUpload} className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Fichier *</label>
              <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nom</label>
              <input
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
                placeholder="Nom du document"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select
                value={form.typeDocument}
                onChange={e => setForm({ ...form, typeDocument: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Description facultative"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={uploading || !file}
                className="bg-primary text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {uploading ? 'Envoi...' : isPrivileged ? 'Publier' : 'Soumettre pour approbation'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Mes documents soumis (membres) */}
      {!isPrivileged && mesDocuments.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={16} /> Mes documents soumis ({mesDocuments.length})
            {pendingCount > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800">{pendingCount} en attente</Badge>
            )}
          </h2>
          <div className="space-y-2">
            {mesDocuments.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-800">{d.nom}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(d.dateUpload)}</p>
                  {d.motifRefus && (
                    <p className="text-xs text-red-500 mt-0.5">Motif de refus : {d.motifRefus}</p>
                  )}
                </div>
                <Badge className={STATUT_STYLE[d.statut || 'PENDING'] || 'bg-gray-100 text-gray-600'}>
                  {STATUT_LABEL[d.statut || 'PENDING'] || d.statut}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search + type filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un document..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none min-w-[160px]">
          <option value="">Tous les types</option>
          {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Liste documents approuvés */}
      <div className="space-y-3">
        {filtered.map((doc) => (
          <Card key={doc.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-gray-800">{doc.nom}</h3>
                  <Badge className="bg-gray-100 text-gray-700">{doc.typeDocument}</Badge>
                  {doc.evenement && (
                    <Badge className="bg-purple-100 text-purple-700">📅 {doc.evenement.titre}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{doc.description || 'Sans description'}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {formatDateTime(doc.dateUpload)} — {Math.ceil((doc.taille || 0) / 1024)} Ko
                  {doc.uploadePar && ` — Par ${doc.uploadePar.prenom} ${doc.uploadePar.nom}`}
                </p>
              </div>
              <button onClick={() => handleDownload(doc)} className="p-2 rounded-lg hover:bg-gray-100" title="Télécharger">
                <Download size={20} />
              </button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-4">Aucun document trouvé</p>
        )}
      </div>

      {/* Publications */}
      {!typeFilter && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen size={20} className="text-primary" /> Publications ({publications.filter(p =>
                !search || p.titre?.toLowerCase().includes(search.toLowerCase())
              ).length})
            </h2>
            <Link href="/dashboard/publications" className="text-primary text-sm hover:underline">Voir tout →</Link>
          </div>
          <div className="space-y-3">
            {publications
              .filter(p => !search || p.titre?.toLowerCase().includes(search.toLowerCase()))
              .map(p => (
                <Card key={p.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-800">{p.titre}</h3>
                        <Badge className="bg-blue-100 text-blue-800">{p.typePub}</Badge>
                        {p.equipe && <Badge className="bg-green-100 text-green-700">{p.equipe}</Badge>}
                      </div>
                      {p.auteurs && p.auteurs.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          {p.auteurs.map(a => `${a.prenom} ${a.nom}`).join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {p.annee}
                        {p.revue && ` — ${p.revue}`}
                        {p.conference && ` — ${p.conference}`}
                      </p>
                    </div>
                    {p.fichierPath && (
                      <a
                        href={`${API_BASE}/api/v1/publications/${p.id}/download`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-gray-100 text-red-500 hover:text-red-700 shrink-0"
                        title="Télécharger le PDF"
                      >
                        <FileText size={20} />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            {publications.filter(p => !search || p.titre?.toLowerCase().includes(search.toLowerCase())).length === 0 && (
              <p className="text-center text-gray-400 py-4">Aucune publication trouvée</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
