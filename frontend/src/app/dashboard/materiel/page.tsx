'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { materielService } from '@/services/materiel.service';
import { membreService } from '@/services/membre.service';
import { DistributionMateriel, Materiel, MembreResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { PackagePlus, Send } from 'lucide-react';

export default function MaterielPage() {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [historique, setHistorique] = useState<DistributionMateriel[]>([]);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [form, setForm] = useState({ nom: '', categorie: '', quantiteTotale: 1, dateArrivage: '' });
  const [distribution, setDistribution] = useState({ materielId: '', membreId: '', quantite: 1, commentaire: '' });

  const load = () => {
    materielService.getStock().then(setMateriels).catch(() => {});
    materielService.getHistorique().then(setHistorique).catch(() => {});
    membreService.getAll().then(setMembres).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const addMateriel = async (event: React.FormEvent) => {
    event.preventDefault();
    await materielService.create(form);
    setForm({ nom: '', categorie: '', quantiteTotale: 1, dateArrivage: '' });
    load();
  };

  const distribuer = async (event: React.FormEvent) => {
    event.preventDefault();
    await materielService.distribuer({
      ...distribution,
      materielId: Number(distribution.materielId),
      membreId: Number(distribution.membreId),
    });
    setDistribution({ materielId: '', membreId: '', quantite: 1, commentaire: '' });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Materiel</h1>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h2 className="font-semibold mb-4">Arrivage</h2>
          <form onSubmit={addMateriel} className="grid gap-3">
            <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Nom du materiel" className="border rounded-lg px-3 py-2" />
            <input value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} placeholder="Categorie" className="border rounded-lg px-3 py-2" />
            <input type="number" min={1} value={form.quantiteTotale} onChange={(e) => setForm({ ...form, quantiteTotale: Number(e.target.value) })} className="border rounded-lg px-3 py-2" />
            <input type="date" value={form.dateArrivage} onChange={(e) => setForm({ ...form, dateArrivage: e.target.value })} className="border rounded-lg px-3 py-2" />
            <button className="bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2"><PackagePlus size={18} /> Ajouter au stock</button>
          </form>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Distribution</h2>
          <form onSubmit={distribuer} className="grid gap-3">
            <select required value={distribution.materielId} onChange={(e) => setDistribution({ ...distribution, materielId: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Materiel</option>
              {materiels.map((m) => <option key={m.id} value={m.id}>{m.nom} ({m.quantiteDisponible})</option>)}
            </select>
            <select required value={distribution.membreId} onChange={(e) => setDistribution({ ...distribution, membreId: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Beneficiaire</option>
              {membres.map((m) => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
            </select>
            <input type="number" min={1} value={distribution.quantite} onChange={(e) => setDistribution({ ...distribution, quantite: Number(e.target.value) })} className="border rounded-lg px-3 py-2" />
            <input value={distribution.commentaire} onChange={(e) => setDistribution({ ...distribution, commentaire: e.target.value })} placeholder="Commentaire" className="border rounded-lg px-3 py-2" />
            <button className="bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2"><Send size={18} /> Distribuer</button>
          </form>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold mb-4">Stock</h2>
          <div className="space-y-3">
            {materiels.map((m) => (
              <div key={m.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{m.nom}</p>
                  <p className="text-sm text-gray-500">{m.categorie || 'Sans categorie'}</p>
                </div>
                <Badge className={m.quantiteDisponible > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {m.quantiteDisponible}/{m.quantiteTotale}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold mb-4">Historique</h2>
          <div className="space-y-3">
            {historique.slice(0, 8).map((item) => (
              <div key={item.id} className="text-sm border-b pb-3">
                <p className="font-medium">{item.materiel?.nom} vers {item.membre?.prenom} {item.membre?.nom}</p>
                <p className="text-gray-500">{item.quantite} unite(s), {formatDate(item.dateDistribution)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
