'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mandatService } from '@/services/mandat.service';
import { membreService } from '@/services/membre.service';
import { Mandat, MembreResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { ShieldPlus } from 'lucide-react';

export default function MandatsPage() {
  const [actif, setActif] = useState<Mandat | null>(null);
  const [historique, setHistorique] = useState<Mandat[]>([]);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [form, setForm] = useState({ directeurId: '', viceDirecteurId: '', dateDebut: '' });

  const load = () => {
    mandatService.getActif().then(setActif).catch(() => setActif(null));
    mandatService.getHistorique().then(setHistorique).catch(() => {});
    membreService.getAll().then(setMembres).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await mandatService.create({
      directeurId: Number(form.directeurId),
      viceDirecteurId: form.viceDirecteurId ? Number(form.viceDirecteurId) : undefined,
      dateDebut: form.dateDebut,
    });
    setForm({ directeurId: '', viceDirecteurId: '', dateDebut: '' });
    load();
  };

  const renderMember = (membre?: MembreResponse) => membre ? `${membre.prenom} ${membre.nom}` : 'Non defini';

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Mandats</h1>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h2 className="font-semibold mb-4">Mandat actif</h2>
          {actif ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Directeur:</span> {renderMember(actif.directeur)}</p>
              <p><span className="text-gray-500">Vice-directeur:</span> {renderMember(actif.viceDirecteur)}</p>
              <p><span className="text-gray-500">Debut:</span> {formatDate(actif.dateDebut)}</p>
              <Badge className="bg-green-100 text-green-800">Actif</Badge>
            </div>
          ) : <p className="text-sm text-gray-400">Aucun mandat actif</p>}
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Nouveau mandat</h2>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <select required value={form.directeurId} onChange={(e) => setForm({ ...form, directeurId: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Directeur</option>
              {membres.map((m) => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
            </select>
            <select value={form.viceDirecteurId} onChange={(e) => setForm({ ...form, viceDirecteurId: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Vice-directeur</option>
              {membres.map((m) => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
            </select>
            <input required type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} className="border rounded-lg px-3 py-2" />
            <button className="bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2"><ShieldPlus size={18} /> Creer</button>
          </form>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold mb-4">Historique</h2>
        <div className="space-y-3">
          {historique.map((mandat) => (
            <div key={mandat.id} className="flex items-center justify-between border-b pb-3 text-sm">
              <div>
                <p className="font-medium">{renderMember(mandat.directeur)}</p>
                <p className="text-gray-500">{formatDate(mandat.dateDebut)} {mandat.dateFin ? `-> ${formatDate(mandat.dateFin)}` : ''}</p>
              </div>
              <Badge className={mandat.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{mandat.actif ? 'Actif' : 'Cloture'}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
