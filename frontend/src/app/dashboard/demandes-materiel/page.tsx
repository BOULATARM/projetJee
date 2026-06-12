'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { demandeMaterielService } from '@/services/demande-materiel.service';
import { materielService } from '@/services/materiel.service';
import { DemandeMateriel, Materiel, RoleSysteme, StatutDemande, TypeMateriel } from '@/types';
import { formatDate, formatDateTime, getStatutColor } from '@/lib/utils';
import { AlertTriangle, CheckCircle, ClipboardPlus, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function DemandesMaterielPage() {
  const { role } = useAuthStore();
  const isDirecteur = role === RoleSysteme.DIRECTEUR;
  const isAdmin = role === RoleSysteme.ADMIN;
  const canRequest = !isDirecteur;

  const [demandes, setDemandes] = useState<DemandeMateriel[]>([]);
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [form, setForm] = useState({
    materielId: '',
    justification: '',
    quantite: 1,
    datePriseSouhaitee: '',
    dateRetourPrevue: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [actionErrors, setActionErrors] = useState<Record<number, string>>({});

  const loadDemandes = () => {
    if (isDirecteur) {
      demandeMaterielService.getAll().then(setDemandes).catch(() => {});
    } else {
      demandeMaterielService.getMesDemandes().then(setDemandes).catch(() => {});
    }
  };

  useEffect(() => {
    loadDemandes();
    if (canRequest) {
      materielService.getAll()
        .then(d => setMateriels(d.filter(m => m.typeMateriel === TypeMateriel.PROVISOIRE)))
        .catch(() => {});
    }
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!form.materielId) { setSubmitError('Veuillez sélectionner un matériel.'); return; }
    if (!form.justification.trim()) { setSubmitError('La raison est obligatoire.'); return; }
    if (!form.datePriseSouhaitee) { setSubmitError('La date de prise est obligatoire.'); return; }
    if (!form.dateRetourPrevue) { setSubmitError('La date de retour est obligatoire.'); return; }
    if (form.datePriseSouhaitee >= form.dateRetourPrevue) { setSubmitError('La date de retour doit être après la date de prise.'); return; }
    const selected = materiels.find(m => m.id === Number(form.materielId));
    if (selected && form.quantite > selected.quantiteDisponible) {
      setSubmitError(`Quantité demandée (${form.quantite}) dépasse le stock disponible (${selected.quantiteDisponible}).`);
      return;
    }
    try {
      await demandeMaterielService.create({
        materielId: Number(form.materielId),
        justification: form.justification,
        quantite: form.quantite,
        datePriseSouhaitee: form.datePriseSouhaitee,
        dateRetourPrevue: form.dateRetourPrevue,
      });
      setForm({ materielId: '', justification: '', quantite: 1, datePriseSouhaitee: '', dateRetourPrevue: '' });
      loadDemandes();
    } catch {
      setSubmitError('Erreur lors de la soumission.');
    }
  };

  const updateStatus = async (id: number, action: 'valider' | 'refuser') => {
    setActionErrors(prev => ({ ...prev, [id]: '' }));
    try {
      if (action === 'valider') await demandeMaterielService.valider(id);
      else await demandeMaterielService.refuser(id);
      loadDemandes();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Erreur lors du traitement.';
      setActionErrors(prev => ({ ...prev, [id]: msg }));
    }
  };

  const pendingCount = demandes.filter(d => d.statut === StatutDemande.PENDING).length;

  // Calcule les unités disponibles sur la période d'une demande (en tenant compte des demandes ACCEPTÉES qui chevauchent)
  const getDispoForPeriod = (demande: DemandeMateriel) => {
    if (!demande.materielDemande || !demande.datePriseSouhaitee || !demande.dateRetourPrevue) return null;
    const matId = demande.materielDemande.id;
    const start = demande.datePriseSouhaitee;
    const end = demande.dateRetourPrevue;
    const overlapping = demandes.filter(d =>
      d.id !== demande.id &&
      d.statut === StatutDemande.ACCEPTEE &&
      d.materielDemande?.id === matId &&
      d.datePriseSouhaitee && d.dateRetourPrevue &&
      d.datePriseSouhaitee <= end &&
      d.dateRetourPrevue >= start
    );
    const reserved = overlapping.reduce((sum, d) => sum + (d.quantite ?? 1), 0);
    const total = demande.materielDemande.quantiteTotale;
    const available = total - reserved;
    return { total, reserved, available, overlapping };
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Demandes de matériel provisoire</h1>

      {/* Request form — members only */}
      {canRequest && (
        <Card className="mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <ClipboardPlus size={18} /> Nouvelle demande
          </h2>
          <form onSubmit={create} className="grid gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matériel provisoire souhaité <span className="text-red-500">*</span>
              </label>
              <select value={form.materielId} onChange={e => setForm({ ...form, materielId: e.target.value, quantite: 1 })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">— Sélectionner un matériel —</option>
                {materiels.map(m => (
                  <option key={m.id} value={m.id} disabled={m.quantiteDisponible === 0}>
                    {m.nom} — {m.quantiteDisponible} disponible(s){m.quantiteDisponible === 0 ? ' (épuisé)' : ''}
                  </option>
                ))}
              </select>
              {form.materielId && (() => {
                const sel = materiels.find(m => m.id === Number(form.materielId));
                return sel ? (
                  <p className={`text-xs mt-1 ${sel.quantiteDisponible > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    Stock disponible : <strong>{sel.quantiteDisponible}</strong> unité(s)
                  </p>
                ) : null;
              })()}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pourquoi avez-vous besoin de ce matériel ? <span className="text-red-500">*</span>
              </label>
              <textarea value={form.justification} onChange={e => setForm({ ...form, justification: e.target.value })}
                placeholder="Expliquez la raison et l'utilisation prévue..." rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Quantité</label>
                <input type="number" min={1}
                  max={materiels.find(m => m.id === Number(form.materielId))?.quantiteDisponible ?? undefined}
                  value={form.quantite}
                  onChange={e => setForm({ ...form, quantite: Number(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Date de prise <span className="text-red-500">*</span>
                </label>
                <input type="date" value={form.datePriseSouhaitee}
                  onChange={e => setForm({ ...form, datePriseSouhaitee: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Date de retour <span className="text-red-500">*</span>
                </label>
                <input type="date" value={form.dateRetourPrevue}
                  onChange={e => setForm({ ...form, dateRetourPrevue: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertTriangle size={16} /> {submitError}
              </div>
            )}

            <button className="bg-primary text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-2">
              <ClipboardPlus size={16} /> Soumettre la demande
            </button>
          </form>
        </Card>
      )}

      {/* Director summary */}
      {isDirecteur && pendingCount > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <Badge className="bg-orange-100 text-orange-800">{pendingCount} en attente</Badge>
          <span className="text-sm text-gray-500">Total: {demandes.length} demandes</span>
        </div>
      )}

      <div className="space-y-3">
        {[...demandes].sort((a, b) => {
          if (a.statut === StatutDemande.PENDING && b.statut !== StatutDemande.PENDING) return -1;
          if (b.statut === StatutDemande.PENDING && a.statut !== StatutDemande.PENDING) return 1;
          return 0;
        }).map(demande => {
          const dispo = demande.statut === StatutDemande.PENDING ? getDispoForPeriod(demande) : null;
          const insufficient = dispo !== null && (demande.quantite ?? 1) > dispo.available;
          return (
          <Card key={demande.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Material + member */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {demande.materielDemande ? (
                    <span className="font-semibold text-gray-800">{demande.materielDemande.nom}</span>
                  ) : (
                    <span className="font-semibold text-gray-800">Matériel non précisé</span>
                  )}
                  <Badge className="bg-orange-100 text-orange-800 text-xs">Provisoire</Badge>
                  {demande.quantite && (
                    <Badge className={`text-xs ${insufficient ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {demande.quantite} unité(s) demandée(s)
                    </Badge>
                  )}
                </div>

                {/* Dispo sur la période (PENDING only) */}
                {dispo !== null && (
                  <div className={`text-xs rounded-lg px-2 py-1 mb-1 inline-flex items-center gap-1 ${
                    insufficient
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {insufficient ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                    Disponible sur cette période : <strong>{dispo.available}/{dispo.total}</strong>
                    {dispo.reserved > 0 && ` (${dispo.reserved} déjà réservée(s))`}
                  </div>
                )}

                <p className="text-xs text-gray-500 mb-1">
                  {demande.membre ? `${demande.membre.prenom} ${demande.membre.nom}` : 'Ma demande'}
                  {' — '}{formatDateTime(demande.dateDemande)}
                </p>

                {/* Dates */}
                {(demande.datePriseSouhaitee || demande.dateRetourPrevue) && (
                  <p className="text-sm text-blue-700 bg-blue-50 rounded px-2 py-1 inline-flex items-center gap-2 mb-1">
                    📅 {demande.datePriseSouhaitee ? formatDate(demande.datePriseSouhaitee) : '?'}
                    {' → '}
                    {demande.dateRetourPrevue ? formatDate(demande.dateRetourPrevue) : '?'}
                  </p>
                )}

                {/* Justification */}
                {demande.justification && (
                  <div className="mt-1 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                    <span className="font-medium text-gray-500 text-xs uppercase tracking-wide">Raison : </span>
                    {demande.justification}
                  </div>
                )}

                {/* Who treated */}
                {demande.traitePar && (
                  <p className="text-xs text-gray-400 mt-1">
                    Traité par {demande.traitePar.prenom} {demande.traitePar.nom}
                    {demande.dateTraitement && ` le ${formatDateTime(demande.dateTraitement)}`}
                  </p>
                )}

                {/* Conflict error */}
                {actionErrors[demande.id] && (
                  <div className="mt-2 flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>{actionErrors[demande.id]}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge className={getStatutColor(demande.statut)}>{demande.statut}</Badge>
                {isDirecteur && demande.statut === StatutDemande.PENDING && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(demande.id, 'valider')}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200">
                      <CheckCircle size={14} /> Accepter
                    </button>
                    <button onClick={() => updateStatus(demande.id, 'refuser')}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200">
                      <XCircle size={14} /> Refuser
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
          );
        })}
        {demandes.length === 0 && (
          <p className="text-center text-gray-400 py-8">Aucune demande</p>
        )}
      </div>
    </div>
  );
}
