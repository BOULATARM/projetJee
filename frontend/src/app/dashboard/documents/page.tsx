'use client';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { documentService } from '@/services/document.service';
import { Document } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Download, Search, Upload } from 'lucide-react';

const documentTypes = ['DEMANDE_FINANCEMENT', 'PROGRAMME', 'ATTESTATION', 'RAPPORT', 'ADMINISTRATIF', 'PV_REUNION', 'CONVENTION', 'PUBLICATION', 'AUTRE'];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ nom: '', description: '', typeDocument: 'AUTRE' });

  const loadDocuments = () => {
    documentService.getAll().then(setDocuments).catch(() => {});
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return documents.filter((doc) =>
      [doc.nom, doc.description, doc.typeDocument].some((value) => value?.toLowerCase().includes(query))
    );
  }, [documents, search]);

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;
    await documentService.upload(file, form);
    setFile(null);
    setForm({ nom: '', description: '', typeDocument: 'AUTRE' });
    loadDocuments();
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Documents</h1>
        <Badge className="bg-blue-100 text-blue-800">{documents.length} archives</Badge>
      </div>

      <Card className="mb-6">
        <form onSubmit={handleUpload} className="grid md:grid-cols-5 gap-3 items-end">
          <label className="md:col-span-2 text-sm">
            <span className="block text-gray-600 mb-1">Fichier</span>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
          </label>
          <label className="text-sm">
            <span className="block text-gray-600 mb-1">Nom</span>
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="block text-gray-600 mb-1">Type</span>
            <select value={form.typeDocument} onChange={(e) => setForm({ ...form, typeDocument: e.target.value })} className="w-full border rounded-lg px-3 py-2">
              {documentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <button type="submit" disabled={!file} className="bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 disabled:opacity-50">
            <Upload size={18} /> Ajouter
          </button>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="md:col-span-5 border rounded-lg px-3 py-2" />
        </form>
      </Card>

      <div className="relative mb-6">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un document..." className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="space-y-4">
        {filtered.map((doc) => (
          <Card key={doc.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-800">{doc.nom}</h3>
                  <Badge className="bg-gray-100 text-gray-700">{doc.typeDocument}</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{doc.description || 'Sans description'}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDateTime(doc.dateUpload)} - {Math.ceil((doc.taille || 0) / 1024)} Ko</p>
              </div>
              <button onClick={() => handleDownload(doc)} className="p-2 rounded-lg hover:bg-gray-100" title="Telecharger">
                <Download size={20} />
              </button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">Aucun document trouve</p>}
      </div>
    </div>
  );
}
