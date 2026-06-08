'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { demandeMaterielService } from '@/services/demande-materiel.service';
import { DemandeMateriel, StatutDemande } from '@/types';
import { formatDateTime, getStatutColor } from '@/lib/utils';
import { CheckCircle, ClipboardPlus, XCircle } from 'lucide-react';

export default function DemandesMaterielPage() {
  const [demandes, setDemandes] = useState<DemandeMateriel[]>([]);
  const [form, setForm] = useState({ description: '', justification: '', quantite: 1 });

  const loadDemandes = () => {
    demandeMaterielService.getAll()
      .then(setDemandes)
      .catch(() => demandeMaterielService.getMesDemandes().then(setDemandes).catch(() => {}));
  };

  useEffect(() => { loadDemandes(); }, []);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    await demandeMaterielService.create(form);
    setForm({ description: '', justification: '', quantite: 1 });
    loadDemandes();
  };

  const updateStatus = async (id: number, action: 'valider' | 'refuser') => {
    if (action === 'valider') {
      await demandeMaterielService.valider(id);
    } else {
      await demandeMaterielService.refuser(id);
    }
    loadDemandes();
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Demandes de matériel</h1>

      <Card className="mb-6">
        <form onSubmit={create} className="grid gap-3">
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Besoin en matériel *" className="border rounded-lg px-3 py-2" />
          <textarea value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })}
            placeholder="Justification" className="border rounded-lg px-3 py-2" />
          <div>
            <label className="block text-sm text-gray-600 mb-1">Quantité</label>
            <input
              type="number"
              min={1}
              value={form.quantite}
              onChange={e => setForm({ ...form, quantite: Number(e.target.value) })}
              className="border rounded-lg px-3 py-2 w-32"
            />
          </div>
          <button className="bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2">
            <ClipboardPlus size={18} /> Soumettre
          </button>
        </form>
      </Card>

      <div className="space-y-4">
        {demandes.map((demande) => (
          <Card key={demande.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-800">{demande.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {demande.membre ? `${demande.membre.prenom} ${demande.membre.nom}` : 'Demande personnelle'}
                  {' — '}{formatDateTime(demande.dateDemande)}
                  {demande.quantite && demande.quantite > 1 && ` — Quantité: ${demande.quantite}`}
                </p>
                {demande.justification && (
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-3">{demande.justification}</p>
                )}
                {demande.traitePar && (
                  <p className="text-xs text-gray-400 mt-1">
                    Traité par {demande.traitePar.prenom} {demande.traitePar.nom}
                    {demande.dateTraitement && ` le ${formatDateTime(demande.dateTraitement)}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatutColor(demande.statut)}>{demande.statut}</Badge>
                {demande.statut === StatutDemande.PENDING && (
                  <>
                    <button onClick={() => updateStatus(demande.id, 'valider')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Valider">
                      <CheckCircle size={20} />
                    </button>
                    <button onClick={() => updateStatus(demande.id, 'refuser')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Refuser">
                      <XCircle size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
        {demandes.length === 0 && <p className="text-center text-gray-400 py-8">Aucune demande</p>}
      </div>
    </div>
  );
}
