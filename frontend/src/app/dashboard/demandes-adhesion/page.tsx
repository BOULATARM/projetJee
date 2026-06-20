'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import { DemandeAdhesion, Equipe, RoleSysteme, StatutDemande } from '@/types';
import { BookOpen, Building2, CheckCircle, Download, FlaskConical, XCircle, GraduationCap } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { toArray } from '@/lib/normalize';
import { useAuthStore } from '@/store/authStore';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '');

export default function DemandesAdhesionPage() {
  const { role } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (role && role === RoleSysteme.ADMIN) router.replace('/dashboard');
  }, [role]);

  const [demandes, setDemandes] = useState<DemandeAdhesion[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [actionError, setActionError] = useState<{ id: number; msg: string } | null>(null);
  // id de la demande pour laquelle on affiche le sélecteur d'équipe
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [selectedEquipeId, setSelectedEquipeId] = useState<string>('');
  const [accepting, setAccepting] = useState(false);

  const canDecide = role === RoleSysteme.DIRECTEUR;

  useEffect(() => {
    api.get('/equipes').then(r => setEquipes(toArray(r.data))).catch(() => {});
    api.get('/demandes-adhesion').then(res => {
      const list = toArray(res.data) as DemandeAdhesion[];
      // PENDING en premier, puis les décidées
      list.sort((a, b) => {
        if (a.statut === StatutDemande.PENDING && b.statut !== StatutDemande.PENDING) return -1;
        if (a.statut !== StatutDemande.PENDING && b.statut === StatutDemande.PENDING) return 1;
        return new Date(b.dateDepot).getTime() - new Date(a.dateDepot).getTime();
      });
      setDemandes(list);
    }).catch(() => {});
  }, []);

  const handleConfirmerAcceptation = async (id: number) => {
    if (!selectedEquipeId) return;
    setAccepting(true);
    setActionError(null);
    try {
      await api.put(`/demandes-adhesion/${id}/accepter`, null, { params: { equipeId: Number(selectedEquipeId) } });
      setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: StatutDemande.ACCEPTEE } : d));
      setAcceptingId(null);
      setSelectedEquipeId('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Erreur lors de l\'acceptation';
      setActionError({ id, msg });
    } finally {
      setAccepting(false);
    }
  };

  const handleRefuser = async (id: number) => {
    setActionError(null);
    const commentaire = window.prompt('Motif de refus (optionnel):') ?? '';
    try {
      await api.put(`/demandes-adhesion/${id}/refuser`, null, { params: { commentaire: commentaire || undefined } });
      setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: StatutDemande.REFUSEE, commentaireRefus: commentaire } : d));
    } catch {
      setActionError({ id, msg: 'Erreur lors du refus' });
    }
  };

  const pending = demandes.filter(d => d.statut === StatutDemande.PENDING);
  const decided = demandes.filter(d => d.statut !== StatutDemande.PENDING);

  const renderCard = (d: DemandeAdhesion) => (
    <Card key={d.id} className={d.statut === StatutDemande.PENDING ? 'border-l-4 border-yellow-400' : ''}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Avatar
              photo={d.photoPath ? `${API_BASE}/uploads/${d.photoPath}` : null}
              nom={d.nom} prenom={d.prenom} size={48} className="shrink-0"
            />
            <div>
              <p className="font-semibold">{d.prenom} {d.nom}</p>
              <p className="text-sm text-gray-500">{d.email}</p>
              {(d.etablissementOrigine || d.laboratoireOrigine) && (
                <div className="flex flex-wrap gap-3 mt-1">
                  {d.etablissementOrigine && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Building2 size={12} /> {d.etablissementOrigine}
                    </span>
                  )}
                  {d.laboratoireOrigine && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <FlaskConical size={12} /> {d.laboratoireOrigine}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Badge className={getStatutColor(d.statut)}>{d.statut}</Badge>
            <Badge className="bg-gray-100 text-gray-600">{d.typeMembreDemande}</Badge>
            {d.equipeId && (() => {
              const eq = equipes.find(e => e.id === d.equipeId);
              return eq ? (
                <span className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  <GraduationCap size={11} /> {eq.nom}
                </span>
              ) : null;
            })()}
            <span className="text-xs text-gray-400">Déposée le {formatDate(d.dateDepot)}</span>
            {d.dateDecision && (
              <span className="text-xs text-gray-400">Décision le {formatDate(d.dateDecision)}</span>
            )}
            {d.decidePar && (
              <span className="text-xs text-gray-400">par {d.decidePar.prenom} {d.decidePar.nom}</span>
            )}
          </div>

          {d.biographie && (
            <p className="mt-2 text-sm text-gray-600 italic">{d.biographie}</p>
          )}
          {d.centresInteret && (
            <p className="mt-1 text-xs text-gray-500">Intérêts : {d.centresInteret}</p>
          )}
          {d.publications && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
                <BookOpen size={12} /> Publications :
              </p>
              {d.publications.split('\n').filter(Boolean).map((link, i) => (
                <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                  className="block text-xs text-primary hover:underline truncate">{link}</a>
              ))}
            </div>
          )}
          {d.motivation && (
            <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">{d.motivation}</p>
          )}
          {d.commentaireRefus && (
            <p className="mt-2 text-sm text-red-600">Refus : {d.commentaireRefus}</p>
          )}
          {d.cvPath && (
            <a
              href={`${API_BASE}/uploads/${d.cvPath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline w-fit"
            >
              <Download size={14} /> Voir le CV (PDF)
            </a>
          )}
        </div>

        {/* Boutons action — uniquement DIRECTEUR et demande PENDING */}
        {d.statut === StatutDemande.PENDING && canDecide && (
          <div className="flex flex-col items-end gap-2 shrink-0">
            {acceptingId !== d.id ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { setAcceptingId(d.id); setSelectedEquipeId(d.equipeId ? String(d.equipeId) : ''); setActionError(null); }}
                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600" title="Accepter"
                >
                  <CheckCircle size={20} />
                </button>
                <button onClick={() => handleRefuser(d.id)}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600" title="Refuser">
                  <XCircle size={20} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 min-w-[220px]">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                  <GraduationCap size={13} /> Choisir l&apos;équipe (obligatoire)
                </div>
                <select
                  value={selectedEquipeId}
                  onChange={e => setSelectedEquipeId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                >
                  <option value="">-- Sélectionner une équipe --</option>
                  {equipes.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.nom}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConfirmerAcceptation(d.id)}
                    disabled={!selectedEquipeId || accepting}
                    className="flex-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <CheckCircle size={14} /> {accepting ? 'En cours...' : 'Confirmer'}
                  </button>
                  <button
                    onClick={() => { setAcceptingId(null); setSelectedEquipeId(''); }}
                    className="px-3 py-1.5 border rounded-lg text-sm text-gray-500 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
                {actionError?.id === d.id && (
                  <p className="text-xs text-red-500">{actionError.msg}</p>
                )}
              </div>
            )}
            {actionError?.id === d.id && acceptingId !== d.id && (
              <p className="text-xs text-red-500 max-w-[160px] text-right">{actionError.msg}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Demandes d&apos;adhésion</h1>

      {/* Section : En attente */}
      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-yellow-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
            En attente ({pending.length})
          </h2>
          <div className="space-y-4">{pending.map(renderCard)}</div>
        </section>
      )}

      {/* Section : Décidées */}
      {decided.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
            Traitées ({decided.length})
          </h2>
          <div className="space-y-4">{decided.map(renderCard)}</div>
        </section>
      )}

      {demandes.length === 0 && (
        <p className="text-gray-400 text-center py-8">Aucune demande d&apos;adhésion</p>
      )}
    </div>
  );
}
