'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate, formatDateTime } from '@/lib/utils';
import { evenementService } from '@/services/evenement.service';
import { documentService } from '@/services/document.service';
import { discussionService } from '@/services/discussion.service';
import { membreService } from '@/services/membre.service';
import { Document, Discussion, EvenementResponse, MembreResponse, RoleSysteme } from '@/types';
import { ArrowLeft, CalendarDays, Download, MapPin, MessageCircle, PlusCircle, Users } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function EvenementDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<EvenementResponse | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [orgRole, setOrgRole] = useState('');
  const [newMsg, setNewMsg] = useState({ sujet: '', contenu: '' });
  const { role } = useAuthStore();
  const canManage = role === RoleSysteme.ADMIN || role === RoleSysteme.DIRECTEUR;

  const load = async () => {
    if (!id) return;
    const evtId = Number(id);
    evenementService.getById(evtId).then(setEvent).catch(() => {});
    documentService.getByEvenement(evtId).then(setDocuments).catch(() => {});
    discussionService.getByEvenement(evtId).then(setDiscussions).catch(() => {});
    membreService.getAll().then(setMembres).catch(() => {});
  };

  useEffect(() => { load(); }, [id]);

  const handleAddOrganisateur = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedOrg) return;
    await api.post(`/evenements/${id}/organisateurs`, null, {
      params: { membreId: Number(selectedOrg), roleOrganisation: orgRole || undefined }
    });
    setSelectedOrg(''); setOrgRole('');
    evenementService.getById(Number(id)).then(setEvent).catch(() => {});
  };

  const handleDownload = async (doc: Document) => {
    const blob = await documentService.download(doc.id);
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url; link.download = doc.nom; link.click();
    URL.revokeObjectURL(url);
  };

  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    await discussionService.create({ ...newMsg, evenementId: Number(id) });
    setNewMsg({ sujet: '', contenu: '' });
    discussionService.getByEvenement(Number(id)).then(setDiscussions).catch(() => {});
  };

  if (!event) return <div className="text-gray-500">Chargement...</div>;

  return (
    <div>
      <Link href="/dashboard/evenements" className="flex items-center gap-2 text-primary mb-4 hover:underline">
        <ArrowLeft size={20} /> Retour aux événements
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-start mb-3">
              <Badge className={getStatutColor(event.statut)}>{event.statut}</Badge>
              <Badge className="bg-purple-100 text-purple-800">{event.type}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{event.titre}</h1>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2"><CalendarDays size={16} /> Début: {formatDateTime(event.dateDebut)}</div>
              <div className="flex items-center gap-2"><CalendarDays size={16} /> Fin: {formatDateTime(event.dateFin)}</div>
              {event.lieu && <div className="flex items-center gap-2"><MapPin size={16} /> {event.lieu}</div>}
              {event.edition && <div>Édition {event.edition} — {event.annee}</div>}
            </div>
            {event.description && <p className="text-gray-600">{event.description}</p>}
          </Card>

          {/* Documents */}
          <Card>
            <h2 className="font-semibold mb-3">Documents liés ({documents.length})</h2>
            {documents.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun document</p>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{doc.nom}</p>
                      <p className="text-xs text-gray-400">{doc.typeDocument} — {formatDate(doc.dateUpload)}</p>
                    </div>
                    <button onClick={() => handleDownload(doc)} className="p-1 text-primary hover:bg-primary/10 rounded">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Discussions */}
          <Card>
            <h2 className="font-semibold mb-3 flex items-center gap-2"><MessageCircle size={18} /> Discussions</h2>
            <form onSubmit={handlePostDiscussion} className="grid gap-2 mb-4">
              <input required value={newMsg.sujet} onChange={e => setNewMsg({ ...newMsg, sujet: e.target.value })}
                placeholder="Sujet" className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
              <textarea required rows={2} value={newMsg.contenu} onChange={e => setNewMsg({ ...newMsg, contenu: e.target.value })}
                placeholder="Message..." className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
              <button type="submit" className="self-end bg-primary text-white px-4 py-2 text-sm rounded-lg">Publier</button>
            </form>
            <div className="space-y-3">
              {discussions.map(d => (
                <div key={d.id} className="border-l-4 border-primary pl-3 py-1">
                  <p className="font-medium text-sm">{d.sujet}</p>
                  <p className="text-sm text-gray-600">{d.contenu}</p>
                  <p className="text-xs text-gray-400">{d.auteur?.prenom} {d.auteur?.nom} — {formatDateTime(d.dateCreation)}</p>
                </div>
              ))}
              {discussions.length === 0 && <p className="text-sm text-gray-400">Aucune discussion</p>}
            </div>
          </Card>
        </div>

        {/* Sidebar: Organisateurs */}
        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Users size={18} /> Organisateurs</h2>
            {event.organisateurs?.length > 0 ? (
              <div className="space-y-2">
                {event.organisateurs.map(o => (
                  <div key={o.id} className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {o.prenom[0]}{o.nom[0]}
                    </div>
                    <div>
                      <p className="font-medium">{o.prenom} {o.nom}</p>
                      {o.roleOrganisation && <p className="text-xs text-gray-400">{o.roleOrganisation}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucun organisateur</p>
            )}

            {canManage && (
              <form onSubmit={handleAddOrganisateur} className="mt-4 grid gap-2">
                <select required value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Ajouter un organisateur</option>
                  {membres.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
                </select>
                <input value={orgRole} onChange={e => setOrgRole(e.target.value)}
                  placeholder="Rôle (ex: Coordinateur)" className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                <button type="submit" className="bg-primary text-white px-3 py-2 text-sm rounded-lg flex items-center justify-center gap-1">
                  <PlusCircle size={14} /> Ajouter
                </button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
