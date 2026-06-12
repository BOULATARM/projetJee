'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { mandatService, MandatAudit } from '@/services/mandat.service';
import { membreService } from '@/services/membre.service';
import { Mandat, MembreResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  ShieldPlus, History, CalendarDays, User, Users,
  CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp,
  RefreshCw, AlertCircle, PlusCircle,
} from 'lucide-react';

const ACTION_META: Record<string, { label: string; color: string }> = {
  CREATION_MANDAT: { label: 'Création',  color: 'bg-green-100 text-green-700' },
  CLOTURE_MANDAT:  { label: 'Clôture',   color: 'bg-red-100 text-red-700' },
};

function fmtDatetime(dt?: string) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function MemberChip({ membre }: { membre?: MembreResponse }) {
  if (!membre) return <span className="text-gray-400 italic text-sm">Non défini</span>;
  return (
    <div className="flex items-center gap-2">
      <Avatar photo={membre.photo} nom={membre.nom} prenom={membre.prenom} size={28} />
      <span className="text-sm font-medium">{membre.prenom} {membre.nom}</span>
    </div>
  );
}

export default function MandatsPage() {
  const [actif, setActif]             = useState<Mandat | null>(null);
  const [historique, setHistorique]   = useState<Mandat[]>([]);
  const [audit, setAudit]             = useState<MandatAudit[]>([]);
  const [membres, setMembres]         = useState<MembreResponse[]>([]);
  const [form, setForm]               = useState({ directeurId: '', viceDirecteurId: '' });
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState('');
  const [auditExpanded, setAuditExpanded] = useState(true);
  // clôture
  const [clotureMandatId, setClotureMandatId] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const load = async () => {
    const [act, hist, aud, memb] = await Promise.all([
      mandatService.getActif(),
      mandatService.getHistorique(),
      mandatService.getAudit(),
      membreService.getAll().catch(() => [] as MembreResponse[]),
    ]);
    setActif(act);
    setHistorique(hist);
    setAudit(aud);
    setMembres(memb);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.directeurId) return;
    setLoading(true);
    try {
      await mandatService.create({
        directeurId: Number(form.directeurId),
        viceDirecteurId: form.viceDirecteurId ? Number(form.viceDirecteurId) : undefined,
      });
      setForm({ directeurId: '', viceDirecteurId: '' });
      showToast('Mandat créé avec succès.');
      await load();
    } catch {
      showToast('Erreur lors de la création du mandat.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloturer = async () => {
    if (!clotureMandatId) return;
    setLoading(true);
    try {
      await mandatService.cloturer(clotureMandatId);
      setClotureMandatId(null);
      showToast('Mandat clôturé avec succès.');
      await load();
    } catch {
      showToast('Erreur lors de la clôture.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">Mandats</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion des mandats de direction du laboratoire</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw size={15} /> Actualiser
        </button>
      </div>

      {/* ── Mandat actif + Formulaire ─────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Mandat actif */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" /> Mandat actif
          </h2>
          {actif ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <Badge className="bg-green-100 text-green-700 text-xs">En cours</Badge>
                <span className="text-xs text-gray-500 ml-auto">
                  Depuis le {formatDate(actif.dateDebut)}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Directeur</p>
                  <MemberChip membre={actif.directeur} />
                </div>
                {actif.viceDirecteur && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Vice-directeur</p>
                    <MemberChip membre={actif.viceDirecteur} />
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <CalendarDays size={13} />
                  <span>Début : {formatDate(actif.dateDebut)}</span>
                  {actif.createdAt && (
                    <span className="ml-auto">Créé le {fmtDatetime(actif.createdAt)}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setClotureMandatId(actif.id)}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 transition"
              >
                <XCircle size={16} /> Clôturer ce mandat
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <AlertCircle size={32} className="opacity-30" />
              <p className="text-sm">Aucun mandat actif</p>
            </div>
          )}
        </Card>

        {/* Formulaire nouveau mandat */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PlusCircle size={18} className="text-primary" /> Nouveau mandat
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Directeur *</label>
              <select
                required
                value={form.directeurId}
                onChange={e => setForm({ ...form, directeurId: e.target.value })}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Sélectionner un directeur…</option>
                {membres.map(m => (
                  <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vice-directeur</label>
              <select
                value={form.viceDirecteurId}
                onChange={e => setForm({ ...form, viceDirecteurId: e.target.value })}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Sélectionner (optionnel)…</option>
                {membres.filter(m => m.id !== Number(form.directeurId)).map(m => (
                  <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                ))}
              </select>
            </div>

            {/* Date système */}
            <div className="bg-gray-50 border rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-gray-700">
              <Clock size={15} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Date de début (système)</p>
                <p className="font-medium">
                  {new Date().toLocaleString('fr-FR', {
                    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <ShieldPlus size={17} /> {loading ? 'Création…' : 'Créer le mandat'}
            </button>
          </form>
        </Card>
      </div>

      {/* ── Historique des mandats (timeline) ────────────────────── */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-3">
          <History size={18} className="text-primary" />
          <div>
            <h2 className="font-semibold text-gray-800">Historique des mandats</h2>
            <p className="text-xs text-gray-400">Trié du plus récent au plus ancien</p>
          </div>
          <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
            {historique.length} mandat{historique.length > 1 ? 's' : ''}
          </span>
        </div>

        {historique.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Aucun mandat enregistré.</div>
        ) : (
          <div className="divide-y">
            {historique.map((m, idx) => (
              <div key={m.id} className={`px-6 py-5 flex gap-5 ${m.actif ? 'bg-green-50/40' : ''}`}>
                {/* Indicateur timeline */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${m.actif ? 'bg-green-500 border-green-400' : 'bg-gray-300 border-gray-200'}`} />
                  {idx < historique.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge className={m.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                      {m.actif ? 'Actif' : 'Clôturé'}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      Mandat #{m.id}
                    </span>
                    {m.createdAt && (
                      <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                        <Clock size={11} /> Créé le {fmtDatetime(m.createdAt)}
                      </span>
                    )}
                    {m.updatedAt && m.updatedAt !== m.createdAt && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        · Modifié le {fmtDatetime(m.updatedAt)}
                      </span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Directeur</p>
                      <MemberChip membre={m.directeur} />
                    </div>
                    {m.viceDirecteur && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Vice-directeur</p>
                        <MemberChip membre={m.viceDirecteur} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} /> Début : <strong className="text-gray-600">{formatDate(m.dateDebut)}</strong>
                    </span>
                    {m.dateFin && (
                      <span className="flex items-center gap-1">
                        → Fin : <strong className="text-gray-600">{formatDate(m.dateFin)}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Journal des actions (audit) ───────────────────────────── */}
      <Card className="p-0 overflow-hidden">
        <button
          onClick={() => setAuditExpanded(v => !v)}
          className="w-full flex items-center gap-3 px-6 py-4 border-b bg-gray-50 hover:bg-gray-100 transition text-left"
        >
          <Clock size={18} className="text-primary" />
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800">Journal des actions</h2>
            <p className="text-xs text-gray-400">Date et heure de chaque création ou clôture de mandat</p>
          </div>
          {audit.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{audit.length}</span>
          )}
          {auditExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {auditExpanded && (
          audit.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">Aucune action enregistrée.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Action</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Détails</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Effectué par</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600 whitespace-nowrap">Date & heure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {audit.map(a => {
                    const meta = ACTION_META[a.action] ?? { label: a.action, color: 'bg-gray-100 text-gray-600' };
                    return (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs max-w-sm">{a.details}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{a.utilisateur}</td>
                        <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {fmtDatetime(a.date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>

      {/* ── Modal clôture ────────────────────────────────────────── */}
      {clotureMandatId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <XCircle size={22} className="text-red-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Clôturer le mandat</h2>
                <p className="text-sm text-gray-500">Cette action est irréversible.</p>
              </div>
            </div>

            {/* Date/heure système affichée */}
            <div className="bg-gray-50 border rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-gray-700">
              <Clock size={16} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Date et heure de clôture (système)</p>
                <p className="font-medium">
                  {new Date().toLocaleString('fr-FR', {
                    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center">
              La date et l&apos;heure exactes seront enregistrées automatiquement.
            </p>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setClotureMandatId(null)}
                className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCloturer}
                disabled={loading}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
              >
                <XCircle size={15} /> {loading ? 'Clôture…' : 'Confirmer la clôture'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
