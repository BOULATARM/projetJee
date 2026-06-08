'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mandatService } from '@/services/mandat.service';
import { membreService } from '@/services/membre.service';
import { Mandat, MembreResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { ShieldPlus } from 'lucide-react';
import api from '@/lib/api';

export default function MandatsPage() {
  const [actif, setActif] = useState<Mandat | null>(null);
  const [historique, setHistorique] = useState<Mandat[]>([]);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [form, setForm] = useState({ directeurId: '', viceDirecteurId: '', dateDebut: '' });
  const [selectedChefs, setSelectedChefs] = useState<number[]>([]);

  const load = () => {
    mandatService.getActif().then(setActif).catch(() => setActif(null));
    mandatService.getHistorique().then(setHistorique).catch(() => {});
    membreService.getAll().then(setMembres).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const created = await mandatService.create({
      directeurId: Number(form.directeurId),
      viceDirecteurId: form.viceDirecteurId ? Number(form.viceDirecteurId) : undefined,
      dateDebut: form.dateDebut,
    });
    if (selectedChefs.length > 0) {
      await api.put(`/mandats/${created.id}/chefs-equipe`, selectedChefs);
    }
    setForm({ directeurId: '', viceDirecteurId: '', dateDebut: '' });
    setSelectedChefs([]);
    load();
  };

  const toggleChef = (id: number) => {
    setSelectedChefs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const renderMember = (membre?: MembreResponse) => membre ? `${membre.prenom} ${membre.nom}` : 'Non défini';

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
              <p><span className="text-gray-500">Début:</span> {formatDate(actif.dateDebut)}</p>
              {actif.chefsEquipe && actif.chefsEquipe.length > 0 && (
                <div>
                  <p className="text-gray-500 mb-1">Chefs d&apos;équipe:</p>
                  <div className="flex flex-wrap gap-1">
                    {actif.chefsEquipe.map(c => (
                      <Badge key={c.id} className="bg-blue-100 text-blue-800">{c.prenom} {c.nom}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <Badge className="bg-green-100 text-green-800">Actif</Badge>
            </div>
          ) : <p className="text-sm text-gray-400">Aucun mandat actif</p>}
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Nouveau mandat</h2>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <select required value={form.directeurId} onChange={(e) => setForm({ ...form, directeurId: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Directeur *</option>
              {membres.map((m) => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
            </select>
            <select value={form.viceDirecteurId} onChange={(e) => setForm({ ...form, viceDirecteurId: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Vice-directeur</option>
              {membres.map((m) => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
            </select>
            <input required type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} className="border rounded-lg px-3 py-2" />
            <div>
              <p className="text-sm text-gray-600 mb-1">Chefs d&apos;équipe</p>
              <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
                {membres.map(m => (
                  <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedChefs.includes(m.id)}
                      onChange={() => toggleChef(m.id)}
                      className="rounded"
                    />
                    {m.prenom} {m.nom}
                  </label>
                ))}
              </div>
            </div>
            <button className="bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2">
              <ShieldPlus size={18} /> Créer
            </button>
          </form>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold mb-4">Historique</h2>
        <div className="space-y-3">
          {historique.map((mandat) => (
            <div key={mandat.id} className="border-b pb-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{renderMember(mandat.directeur)}</p>
                  <p className="text-gray-500">{formatDate(mandat.dateDebut)} {mandat.dateFin ? `→ ${formatDate(mandat.dateFin)}` : ''}</p>
                  {mandat.viceDirecteur && (
                    <p className="text-gray-400">VD: {renderMember(mandat.viceDirecteur)}</p>
                  )}
                  {mandat.chefsEquipe && mandat.chefsEquipe.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mandat.chefsEquipe.map(c => (
                        <Badge key={c.id} className="bg-gray-100 text-gray-600 text-xs">{c.prenom} {c.nom}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Badge className={mandat.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {mandat.actif ? 'Actif' : 'Clôturé'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
