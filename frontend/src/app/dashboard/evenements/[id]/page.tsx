'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate, formatDateTime } from '@/lib/utils';
import { evenementService } from '@/services/evenement.service';
import { documentService } from '@/services/document.service';
import { membreService } from '@/services/membre.service';
import { Document, EvenementResponse, MembreResponse, RoleSysteme } from '@/types';
import { ArrowLeft, CalendarDays, CheckCircle, Download, MapPin, PlusCircle, Users, XCircle, Clock, Upload, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface ParticipationDTO {
  id: number;
  membreId: number;
  prenom: string;
  nom: string;
  photo?: string;
  statutMembre: string;
  statut: 'EN_ATTENTE' | 'CONFIRME' | 'REFUSE';
  dateInscription: string;
}

const STATUTS_BLOQUES = ['RETRAITE', 'ANCIEN'];

export default function EvenementDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<EvenementResponse | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [participations, setParticipations] = useState<ParticipationDTO[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [orgRole, setOrgRole] = useState('');
  const [myParticipation, setMyParticipation] = useState<ParticipationDTO | null>(null);
  const [participating, setParticipating] = useState(false);
  const { role, statut: myStatutMembre, membreId: myMembreId } = useAuthStore();
  const isDirecteur = role === RoleSysteme.DIRECTEUR || role === RoleSysteme.VICE_DIRECTEUR;
  const canManage = role === RoleSysteme.DIRECTEUR || role === RoleSysteme.VICE_DIRECTEUR;
  const isBloque = myStatutMembre ? STATUTS_BLOQUES.includes(myStatutMembre) : false;

  const [annule, setAnnule] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState('RAPPORT');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!id) return;
    const evtId = Number(id);
    evenementService.getById(evtId).then(e => {
      setEvent(e);
      setParticipations((e as any).participations ?? []);
      setAnnule(false);
    }).catch((err) => {
      if (err?.response?.status === 400 || err?.response?.status === 500) setAnnule(true);
    });
    documentService.getByEvenement(evtId).then(setDocuments).catch(() => {});
    membreService.getAll().then(setMembres).catch(() => {});
  };

  useEffect(() => { load(); }, [id]);

  // Trouver ma participation
  useEffect(() => {
    if (!myMembreId) { setMyParticipation(null); return; }
    const mine = participations.find(p => p.membreId === myMembreId);
    setMyParticipation(mine ?? null);
  }, [participations, myMembreId]);

  const handleAddOrganisateur = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedOrg) return;
    await api.post(`/evenements/${id}/organisateurs`, null, {
      params: { membreId: Number(selectedOrg), role: orgRole || '' }
    });
    setSelectedOrg(''); setOrgRole('');
    evenementService.getById(Number(id)).then(ev => {
      setEvent(ev);
      setParticipations((ev as any).participations ?? []);
    }).catch(() => {});
  };

  const handleParticiper = async () => {
    if (!id) return;
    setParticipating(true);
    try {
      const res = await api.post(`/evenements/${id}/participer`);
      setMyParticipation(res.data);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erreur lors de la demande de participation.');
    } finally {
      setParticipating(false);
    }
  };

  const handleConfirmer = async (membreId: number) => {
    await api.put(`/evenements/${id}/participations/${membreId}/confirmer`);
    await load();
  };

  const handleRefuser = async (membreId: number) => {
    await api.put(`/evenements/${id}/participations/${membreId}/refuser`);
    await load();
  };

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploadingDoc(true);
    try {
      await documentService.upload(file, {
        nom: file.name,
        typeDocument: docType,
        evenementId: Number(id),
      });
      documentService.getByEvenement(Number(id)).then(setDocuments);
    } catch {
      alert('Erreur lors de l\'upload du document.');
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    if (!confirm('Supprimer ce document ?')) return;
    await documentService.delete(docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleDownload = async (doc: Document) => {
    const blob = await documentService.download(doc.id);
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url; link.download = doc.nom; link.click();
    URL.revokeObjectURL(url);
  };

  const statutBadge = (s: string) => {
    if (s === 'CONFIRME') return <Badge className="bg-green-100 text-green-700 text-xs">Confirmé</Badge>;
    if (s === 'EN_ATTENTE') return <Badge className="bg-yellow-100 text-yellow-700 text-xs">En attente</Badge>;
    return <Badge className="bg-red-100 text-red-600 text-xs">Refusé</Badge>;
  };

  if (annule) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <XCircle size={48} className="text-red-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Événement annulé</h2>
      <p className="text-gray-500 mb-6">Cet événement a été annulé et n'est plus accessible.</p>
      <Link href="/dashboard/evenements" className="text-primary hover:underline flex items-center gap-1">
        <ArrowLeft size={16} /> Retour aux événements
      </Link>
    </div>
  );
  if (!event) return <div className="text-gray-500">Chargement...</div>;

  const enAttente = participations.filter(p => p.statut === 'EN_ATTENTE');
  const confirmes = participations.filter(p => p.statut === 'CONFIRME');

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

            {/* Bouton de participation — tous les membres authentifiés */}
            {(
              <div className="mt-4 pt-4 border-t">
                {isBloque ? (
                  <p className="text-sm text-red-500 flex items-center gap-2">
                    <XCircle size={16} /> Vous ne pouvez pas participer à cet événement.
                  </p>
                ) : myParticipation ? (
                  <div className="flex items-center gap-2">
                    {myParticipation.statut === 'CONFIRME' && (
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle size={16} /> Votre participation est confirmée.
                      </p>
                    )}
                    {myParticipation.statut === 'EN_ATTENTE' && (
                      <p className="text-sm text-yellow-600 flex items-center gap-2">
                        <Clock size={16} /> Votre demande est en attente de confirmation par le directeur.
                      </p>
                    )}
                    {myParticipation.statut === 'REFUSE' && (
                      <p className="text-sm text-red-500 flex items-center gap-2">
                        <XCircle size={16} /> Votre participation a été refusée.
                      </p>
                    )}
                  </div>
                ) : (
                  <button onClick={handleParticiper} disabled={participating}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
                    <PlusCircle size={16} /> {participating ? 'En cours...' : 'Participer à cet événement'}
                  </button>
                )}
              </div>
            )}
          </Card>

          {/* Documents */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Documents liés ({documents.length})</h2>
              {canManage && (
                <div className="flex items-center gap-2">
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="RAPPORT">Rapport</option>
                    <option value="PROGRAMME">Programme</option>
                    <option value="ATTESTATION">Attestation</option>
                    <option value="DEMANDE_FINANCEMENT">Demande financement</option>
                    <option value="ADMINISTRATIF">Administratif</option>
                    <option value="PUBLICATION">Publication / Article</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleUploadDoc}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingDoc}
                    className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded text-xs hover:bg-blue-800 disabled:opacity-50"
                  >
                    <Upload size={13} />
                    {uploadingDoc ? 'Upload...' : 'Ajouter'}
                  </button>
                </div>
              )}
            </div>
            {documents.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun document lié à cet événement.</p>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{doc.nom}</p>
                      <p className="text-xs text-gray-400">{doc.typeDocument} — {formatDate(doc.dateUpload)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDownload(doc)} className="p-1 text-primary hover:bg-primary/10 rounded" title="Télécharger">
                        <Download size={16} />
                      </button>
                      {canManage && (
                        <button onClick={() => handleDeleteDoc(doc.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Supprimer">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Demandes en attente — directeur uniquement */}
          {isDirecteur && enAttente.length > 0 && (
            <Card>
              <h2 className="font-semibold mb-3 flex items-center gap-2 text-yellow-700">
                <Clock size={16} /> Demandes en attente ({enAttente.length})
              </h2>
              <div className="space-y-2">
                {enAttente.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Avatar photo={p.photo} nom={p.nom} prenom={p.prenom} size={28} />
                      <div>
                        <p className="text-sm font-medium">{p.prenom} {p.nom}</p>
                        <p className="text-xs text-gray-400">{p.statutMembre}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleConfirmer(p.membreId)}
                        className="text-green-600 hover:bg-green-50 p-1 rounded" title="Confirmer">
                        <CheckCircle size={18} />
                      </button>
                      <button onClick={() => handleRefuser(p.membreId)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded" title="Refuser">
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organisateurs */}
          <Card>
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Users size={18} /> Organisateurs</h2>
            {event.organisateurs?.length > 0 ? (
              <div className="space-y-2">
                {event.organisateurs.map(o => (
                  <div key={o.id} className="flex items-center gap-2 text-sm">
                    <Avatar photo={o.photo} nom={o.nom} prenom={o.prenom} size={32} />
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
                  <option value="">Sélectionner un membre</option>
                  {membres
                    .filter(m => !event.organisateurs?.some(o => o.id === m.id))
                    .map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
                </select>
                <input value={orgRole} onChange={e => setOrgRole(e.target.value)}
                  placeholder="Rôle (ex: Coordinateur)" className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                <button type="submit" className="bg-primary text-white px-3 py-2 text-sm rounded-lg flex items-center justify-center gap-1">
                  <PlusCircle size={14} /> Ajouter
                </button>
              </form>
            )}
          </Card>

          {/* Participants confirmés */}
          <Card>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" /> Participants ({confirmes.length})
            </h2>
            {confirmes.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun participant confirmé.</p>
            ) : (
              <div className="space-y-2">
                {confirmes.map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <Avatar photo={p.photo} nom={p.nom} prenom={p.prenom} size={28} />
                    <div>
                      <p className="text-sm font-medium">{p.prenom} {p.nom}</p>
                      <p className="text-xs text-gray-400">{p.statutMembre}</p>
                    </div>
                    {statutBadge(p.statut)}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
