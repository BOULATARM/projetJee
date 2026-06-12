'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { materielService } from '@/services/materiel.service';
import { membreService } from '@/services/membre.service';
import { DistributionMateriel, Materiel, MaterielHistorique, MembreResponse, RoleSysteme, TypeMateriel } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ChevronDown, ChevronRight, PackagePlus, Pencil, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const TYPE_BADGE: Record<TypeMateriel, string> = {
  [TypeMateriel.DEFINITIF]: 'bg-blue-100 text-blue-800',
  [TypeMateriel.PROVISOIRE]: 'bg-orange-100 text-orange-800',
};

export default function MaterielPage() {
  const { role } = useAuthStore();
  const isAdmin = role === RoleSysteme.ADMIN;
  const isDirecteur = role === RoleSysteme.DIRECTEUR;

  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [historique, setHistorique] = useState<DistributionMateriel[]>([]);
  const [membres, setMembres] = useState<MembreResponse[]>([]);

  // Admin: arrivage form
  const [form, setForm] = useState({ nom: '', description: '', quantiteTotale: 1, typeMateriel: TypeMateriel.DEFINITIF });
  // Admin: edit modal
  const [editTarget, setEditTarget] = useState<Materiel | null>(null);
  const [editForm, setEditForm] = useState({ nom: '', description: '', quantiteTotale: 1, typeMateriel: TypeMateriel.DEFINITIF });
  const [editHistorique, setEditHistorique] = useState<MaterielHistorique[]>([]);
  const [showEditHist, setShowEditHist] = useState(false);
  // Director: distribution form
  const [distribution, setDistribution] = useState({ materielId: '', membreId: '', quantite: 1, commentaire: '' });
  const [distribError, setDistribError] = useState<string | null>(null);
  const [expandedHist, setExpandedHist] = useState<number | null>(null);
  const [materielHistoriques, setMaterielHistoriques] = useState<Record<number, MaterielHistorique[]>>({});

  const load = () => {
    materielService.getAll().then(setMateriels).catch(() => {});
    if (isDirecteur) {
      materielService.getHistorique().then(setHistorique).catch(() => {});
      membreService.getAll().then(setMembres).catch(() => {});
    }
  };

  useEffect(() => { load(); }, []);

  const addMateriel = async (e: React.FormEvent) => {
    e.preventDefault();
    await materielService.create({ ...form, dateArrivage: new Date().toISOString().split('T')[0] });
    setForm({ nom: '', description: '', quantiteTotale: 1, typeMateriel: TypeMateriel.DEFINITIF });
    load();
  };

  const openEdit = async (m: Materiel) => {
    setEditTarget(m);
    setEditForm({ nom: m.nom, description: m.description || '', quantiteTotale: m.quantiteTotale, typeMateriel: m.typeMateriel || TypeMateriel.DEFINITIF });
    setShowEditHist(false);
    const hist = await materielService.getHistoriqueMateriel(m.id).catch(() => []);
    setEditHistorique(hist);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    await materielService.update(editTarget.id, editForm);
    setEditTarget(null);
    load();
  };

  const distribuer = async (e: React.FormEvent) => {
    e.preventDefault();
    setDistribError(null);
    const selected = materiels.find(m => m.id === Number(distribution.materielId));
    if (selected && distribution.quantite > selected.quantiteDisponible) {
      setDistribError(`Stock insuffisant : seulement ${selected.quantiteDisponible} unité(s) disponible(s) pour "${selected.nom}".`);
      return;
    }
    if (distribution.quantite < 1) {
      setDistribError('La quantité doit être au moins 1.');
      return;
    }
    try {
      await materielService.distribuer({
        materielId: Number(distribution.materielId),
        membreId: Number(distribution.membreId),
        quantite: distribution.quantite,
        commentaire: distribution.commentaire || undefined,
        typeMateriel: TypeMateriel.DEFINITIF,
      });
      setDistribution({ materielId: '', membreId: '', quantite: 1, commentaire: '' });
      load();
    } catch {
      setDistribError('Erreur lors de la distribution. Veuillez réessayer.');
    }
  };

  const toggleHistMateriel = async (id: number) => {
    if (expandedHist === id) { setExpandedHist(null); return; }
    setExpandedHist(id);
    if (!materielHistoriques[id]) {
      const hist = await materielService.getHistoriqueMateriel(id).catch(() => []);
      setMaterielHistoriques(prev => ({ ...prev, [id]: hist }));
    }
  };

  const ACTION_BADGE: Record<string, string> = {
    CREATION: 'bg-green-100 text-green-700',
    MODIFICATION: 'bg-yellow-100 text-yellow-700',
    DISTRIBUTION: 'bg-blue-100 text-blue-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Matériel</h1>

      {/* ADMIN: Arrivage + Stock */}
      {isAdmin && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="font-semibold mb-4 flex items-center gap-2"><PackagePlus size={18} /> Enregistrer un arrivage</h2>
            <form onSubmit={addMateriel} className="grid gap-3">
              <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                placeholder="Nom du matériel *" className="border rounded-lg px-3 py-2 text-sm" />
              <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Description" className="border rounded-lg px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Quantité</label>
                  <input type="number" min={1} value={form.quantiteTotale} onChange={e => setForm({ ...form, quantiteTotale: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select value={form.typeMateriel} onChange={e => setForm({ ...form, typeMateriel: e.target.value as TypeMateriel })}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value={TypeMateriel.DEFINITIF}>Définitif</option>
                    <option value={TypeMateriel.PROVISOIRE}>Provisoire</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date d&apos;arrivage</label>
                <input type="text" readOnly value={new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-default" />
              </div>
              <button className="bg-primary text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-2">
                <PackagePlus size={16} /> Ajouter au stock
              </button>
            </form>
          </Card>

          <Card>
            <h2 className="font-semibold mb-4">Stock</h2>
            <div className="space-y-2">
              {materiels.map(m => (
                <div key={m.id}>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{m.nom}</p>
                        <Badge className={TYPE_BADGE[m.typeMateriel || TypeMateriel.DEFINITIF] || 'bg-gray-100 text-gray-600'}>
                          {m.typeMateriel === TypeMateriel.PROVISOIRE ? 'Provisoire' : 'Définitif'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{m.categorie || 'Sans catégorie'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={m.quantiteDisponible > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {m.quantiteDisponible}/{m.quantiteTotale}
                      </Badge>
                      <button onClick={() => openEdit(m)} className="p-1 text-gray-400 hover:text-primary" title="Modifier">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => toggleHistMateriel(m.id)} className="p-1 text-gray-400 hover:text-primary" title="Historique">
                        {expandedHist === m.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </div>
                  </div>
                  {expandedHist === m.id && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                      {(materielHistoriques[m.id] || []).length === 0 && (
                        <p className="text-xs text-gray-400 py-1">Aucun historique</p>
                      )}
                      {(materielHistoriques[m.id] || []).map(h => (
                        <div key={h.id} className="text-xs text-gray-600 py-1">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-2 ${ACTION_BADGE[h.action] || 'bg-gray-100 text-gray-600'}`}>
                            {h.action}
                          </span>
                          {h.details}
                          <span className="ml-2 text-gray-400">{formatDateTime(h.dateAction)}</span>
                          {h.faitPar && <span className="ml-1 text-gray-400">par {h.faitPar.prenom} {h.faitPar.nom}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {materiels.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Aucun matériel</p>}
            </div>
          </Card>
        </div>
      )}

      {/* DIRECTEUR: Stock + Distribution + Historique distributions */}
      {isDirecteur && (
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Send size={18} /> Distribution</h2>
            <form onSubmit={distribuer} className="grid gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Matériel</label>
                <select required value={distribution.materielId}
                  onChange={e => { setDistribError(null); setDistribution({ ...distribution, materielId: e.target.value, quantite: 1 }); }}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Sélectionner un matériel</option>
                  {materiels.filter(m => m.typeMateriel !== TypeMateriel.PROVISOIRE).map(m => (
                    <option key={m.id} value={m.id} disabled={m.quantiteDisponible === 0}>
                      {m.nom} ({m.quantiteDisponible} dispo){m.quantiteDisponible === 0 ? ' — épuisé' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bénéficiaire</label>
                <select required value={distribution.membreId} onChange={e => setDistribution({ ...distribution, membreId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Sélectionner un membre</option>
                  {membres.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Quantité</label>
                {(() => {
                  const selected = materiels.find(m => m.id === Number(distribution.materielId));
                  const dispo = selected?.quantiteDisponible ?? Infinity;
                  const isOver = distribution.quantite > dispo;
                  return (
                    <>
                      <input
                        type="number" min={1} max={dispo !== Infinity ? dispo : undefined}
                        value={distribution.quantite}
                        onChange={e => { setDistribError(null); setDistribution({ ...distribution, quantite: Number(e.target.value) }); }}
                        className={`w-full border rounded-lg px-3 py-2 text-sm ${isOver ? 'border-red-400 bg-red-50' : ''}`}
                      />
                      {selected && (
                        <p className={`text-xs mt-1 ${isOver ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                          {isOver
                            ? `⚠ Dépasse le stock disponible (max : ${dispo})`
                            : `Disponible : ${dispo} unité(s)`}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
              <input value={distribution.commentaire} onChange={e => setDistribution({ ...distribution, commentaire: e.target.value })}
                placeholder="Commentaire (optionnel)" className="border rounded-lg px-3 py-2 text-sm" />
              {distribError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                  <span className="mt-0.5">⚠</span>
                  <span>{distribError}</span>
                </div>
              )}
              <button
                disabled={(() => {
                  const selected = materiels.find(m => m.id === Number(distribution.materielId));
                  return !distribution.materielId || !distribution.membreId || distribution.quantite < 1 || (!!selected && distribution.quantite > selected.quantiteDisponible);
                })()}
                className="bg-primary text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Send size={16} /> Distribuer
              </button>
            </form>
          </Card>

          <Card>
            <h2 className="font-semibold mb-4">Stock disponible</h2>
            <div className="space-y-2">
              {materiels.map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{m.nom}</p>
                      <Badge className={TYPE_BADGE[m.typeMateriel || TypeMateriel.DEFINITIF] || 'bg-gray-100 text-gray-600'}>
                        {m.typeMateriel === TypeMateriel.PROVISOIRE ? 'Provisoire' : 'Définitif'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{m.categorie || 'Sans catégorie'}</p>
                  </div>
                  <Badge className={m.quantiteDisponible > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {m.quantiteDisponible}/{m.quantiteTotale}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {isDirecteur && (
        <Card>
          <h2 className="font-semibold mb-4">Historique des distributions</h2>
          <div className="space-y-2">
            {historique.map(item => (
              <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <p className="font-medium">{item.materiel?.nom} → {item.membre?.prenom} {item.membre?.nom}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.quantite} unité(s) • {formatDate(item.dateDistribution)}
                    {item.typeMateriel && (
                      <Badge className={`ml-2 ${TYPE_BADGE[item.typeMateriel]}`}>
                        {item.typeMateriel === TypeMateriel.PROVISOIRE ? 'Provisoire' : 'Définitif'}
                      </Badge>
                    )}
                  </p>
                  {item.typeMateriel === TypeMateriel.PROVISOIRE && item.dateRetourPrevue && (
                    <p className="text-xs text-orange-600 mt-0.5">Retour prévu: {formatDate(item.dateRetourPrevue)}</p>
                  )}
                  {item.commentaire && <p className="text-xs text-gray-400 mt-0.5">{item.commentaire}</p>}
                </div>
                {item.distributePar && (
                  <span className="text-xs text-gray-400">par {item.distributePar.prenom} {item.distributePar.nom}</span>
                )}
              </div>
            ))}
            {historique.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Aucune distribution</p>}
          </div>
        </Card>
      )}

      {/* Members: read-only stock view */}
      {!isAdmin && !isDirecteur && (
        <Card>
          <h2 className="font-semibold mb-4">Stock de matériel</h2>
          <div className="space-y-2">
            {materiels.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{m.nom}</p>
                    <Badge className={TYPE_BADGE[m.typeMateriel || TypeMateriel.DEFINITIF] || 'bg-gray-100 text-gray-600'}>
                      {m.typeMateriel === TypeMateriel.PROVISOIRE ? 'Provisoire' : 'Définitif'}
                    </Badge>
                  </div>
                  {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                  <p className="text-xs text-gray-400">{m.categorie || 'Sans catégorie'}</p>
                </div>
                <Badge className={m.quantiteDisponible > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {m.quantiteDisponible} disponible(s)
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Admin edit modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl p-6">
            <h3 className="font-bold text-gray-800 mb-4">Modifier — {editTarget.nom}</h3>
            <form onSubmit={saveEdit} className="grid gap-3">
              <input required value={editForm.nom} onChange={e => setEditForm({ ...editForm, nom: e.target.value })}
                placeholder="Nom *" className="border rounded-lg px-3 py-2 text-sm" />
              <textarea rows={2} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description" className="border rounded-lg px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Quantité totale</label>
                  <input type="number" min={1} value={editForm.quantiteTotale} onChange={e => setEditForm({ ...editForm, quantiteTotale: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select value={editForm.typeMateriel} onChange={e => setEditForm({ ...editForm, typeMateriel: e.target.value as TypeMateriel })}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value={TypeMateriel.DEFINITIF}>Définitif</option>
                    <option value={TypeMateriel.PROVISOIRE}>Provisoire</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white text-sm rounded-lg">Sauvegarder</button>
              </div>
            </form>

            <div className="mt-4 border-t pt-4">
              <button onClick={() => setShowEditHist(v => !v)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary">
                {showEditHist ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Historique des modifications ({editHistorique.length})
              </button>
              {showEditHist && (
                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                  {editHistorique.map(h => (
                    <div key={h.id} className="text-xs text-gray-600 py-1 flex items-start gap-2">
                      <span className={`shrink-0 px-1.5 py-0.5 rounded font-medium ${ACTION_BADGE[h.action] || 'bg-gray-100 text-gray-600'}`}>{h.action}</span>
                      <span>{h.details}</span>
                      <span className="ml-auto shrink-0 text-gray-400">{formatDateTime(h.dateAction)}</span>
                    </div>
                  ))}
                  {editHistorique.length === 0 && <p className="text-xs text-gray-400">Aucun historique</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
