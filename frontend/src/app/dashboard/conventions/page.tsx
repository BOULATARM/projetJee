'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { conventionService } from '@/services/convention.service';
import { documentService } from '@/services/document.service';
import { Convention, Document, RoleSysteme } from '@/types';
import { formatDate, getStatutColor } from '@/lib/utils';
import { ChevronDown, ChevronUp, Download, Handshake } from 'lucide-react';
import api from '@/lib/api';
import { toArray } from '@/lib/normalize';
import { useAuthStore } from '@/store/authStore';

const TYPE_PARTENAIRES = ['Académique', 'Industriel', 'Gouvernemental', 'International', 'Autre'];

export default function ConventionsPage() {
  const { role } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (role && role === RoleSysteme.ADMIN) router.replace('/dashboard');
  }, [role]);

  const [conventions, setConventions] = useState<Convention[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [conventionDocs, setConventionDocs] = useState<Record<number, Document[]>>({});
  const [conventionActivites, setConventionActivites] = useState<Record<number, { id: number; description: string; dateActivite: string }[]>>({});
  const [form, setForm] = useState({ titre: '', partenaire: '', typePartenaire: '', paysPartenaire: '', dateSignature: '', dateExpiration: '', description: '' });
  const [newActivite, setNewActivite] = useState('');

  const loadConventions = () => conventionService.getAll().then(setConventions).catch(() => {});

  useEffect(() => { loadConventions(); }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await conventionService.create(form);
    setForm({ titre: '', partenaire: '', typePartenaire: '', paysPartenaire: '', dateSignature: '', dateExpiration: '', description: '' });
    loadConventions();
  };

  const toggleDetails = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!conventionDocs[id]) {
      documentService.getByConvention(id).then(docs => setConventionDocs(prev => ({ ...prev, [id]: docs }))).catch(() => {});
    }
    if (!conventionActivites[id]) {
      api.get(`/conventions/${id}/activites`).then(r => setConventionActivites(prev => ({ ...prev, [id]: toArray(r.data) }))).catch(() => {
        setConventionActivites(prev => ({ ...prev, [id]: [] }));
      });
    }
  };

  const handleAddActivite = async (conventionId: number) => {
    if (!newActivite.trim()) return;
    await api.post(`/conventions/${conventionId}/activites`, { description: newActivite });
    setNewActivite('');
    api.get(`/conventions/${conventionId}/activites`).then(r =>
      setConventionActivites(prev => ({ ...prev, [conventionId]: toArray(r.data) }))).catch(() => {});
  };

  const handleDownloadDoc = async (doc: Document) => {
    const blob = await documentService.download(doc.id);
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url; link.download = doc.nom; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Conventions et collaborations</h1>

      {(role === RoleSysteme.DIRECTEUR || role === RoleSysteme.VICE_DIRECTEUR) && (
      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-3">
          <input required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Titre *" className="border rounded-lg px-3 py-2" />
          <input value={form.partenaire} onChange={(e) => setForm({ ...form, partenaire: e.target.value })} placeholder="Partenaire" className="border rounded-lg px-3 py-2" />
          <select value={form.typePartenaire} onChange={(e) => setForm({ ...form, typePartenaire: e.target.value })} className="border rounded-lg px-3 py-2">
            <option value="">Type de partenaire</option>
            {TYPE_PARTENAIRES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={form.paysPartenaire} onChange={(e) => setForm({ ...form, paysPartenaire: e.target.value })} placeholder="Pays" className="border rounded-lg px-3 py-2" />
          <input type="date" value={form.dateSignature} onChange={(e) => setForm({ ...form, dateSignature: e.target.value })} className="border rounded-lg px-3 py-2" />
          <input type="date" value={form.dateExpiration} onChange={(e) => setForm({ ...form, dateExpiration: e.target.value })} className="border rounded-lg px-3 py-2" />
          <button className="bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 md:col-span-3">
            <Handshake size={18} /> Ajouter
          </button>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="md:col-span-3 border rounded-lg px-3 py-2" />
        </form>
      </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {conventions.map((convention) => (
          <div key={convention.id}>
            <Card>
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{convention.titre}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {convention.partenaire || 'Partenaire non précisé'}
                    {convention.paysPartenaire ? ` — ${convention.paysPartenaire}` : ''}
                  </p>
                  {convention.typePartenaire && (
                    <Badge className="bg-blue-100 text-blue-800 mt-1">{convention.typePartenaire}</Badge>
                  )}
                </div>
                <Badge className={getStatutColor(convention.statut)}>{convention.statut}</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-3">{convention.description}</p>
              <p className="text-xs text-gray-400 mt-3">
                {convention.dateSignature ? formatDate(convention.dateSignature) : 'Signature non définie'}
                {convention.dateExpiration ? ` → ${formatDate(convention.dateExpiration)}` : ''}
              </p>
              <button
                onClick={() => toggleDetails(convention.id)}
                className="flex items-center gap-1 text-sm text-primary mt-3 hover:underline"
              >
                {expandedId === convention.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {expandedId === convention.id ? 'Masquer les détails' : 'Voir documents & activités'}
              </button>

              {expandedId === convention.id && (
                <div className="mt-4 space-y-4 border-t pt-4">
                  {/* Documents */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Documents</h4>
                    {(conventionDocs[convention.id] || []).length === 0
                      ? <p className="text-xs text-gray-400">Aucun document</p>
                      : (conventionDocs[convention.id] || []).map(doc => (
                        <div key={doc.id} className="flex items-center justify-between text-sm py-1">
                          <span>{doc.nom}</span>
                          <button onClick={() => handleDownloadDoc(doc)} className="text-primary hover:underline flex items-center gap-1">
                            <Download size={14} /> Télécharger
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* Activités */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Activités associées</h4>
                    {(conventionActivites[convention.id] || []).length === 0
                      ? <p className="text-xs text-gray-400">Aucune activité</p>
                      : (conventionActivites[convention.id] || []).map(a => (
                        <div key={a.id} className="text-sm text-gray-600 py-1 border-b last:border-0">
                          {a.description}
                          {a.dateActivite && <span className="text-xs text-gray-400 ml-2">({formatDate(a.dateActivite)})</span>}
                        </div>
                      ))}
                    <div className="flex gap-2 mt-2">
                      <input
                        value={newActivite}
                        onChange={e => setNewActivite(e.target.value)}
                        placeholder="Nouvelle activité..."
                        className="flex-1 border rounded-lg px-3 py-1 text-sm"
                      />
                      <button onClick={() => handleAddActivite(convention.id)}
                        className="bg-primary text-white px-3 py-1 text-sm rounded-lg">
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
