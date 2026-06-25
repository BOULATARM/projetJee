'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { reunionService } from '@/services/reunion.service';
import { membreService } from '@/services/membre.service';
import { MembreResponse, Reunion, RoleSysteme } from '@/types';
import { formatDateTime, getStatutColor } from '@/lib/utils';
import { CalendarPlus, MapPin, ArrowRight, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toArray } from '@/lib/normalize';

export default function ReunionsPage() {
  const { role } = useAuthStore();
  const isDirecteur = role === RoleSysteme.DIRECTEUR || role === RoleSysteme.VICE_DIRECTEUR;

  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [form, setForm] = useState({ titre: '', dateReunion: '', lieu: '', ordreJour: '' });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadReunions = async () => {
    try {
      const data = await reunionService.getAll();
      setReunions(toArray(data));
    } catch {
      setReunions([]);
    }
  };

  useEffect(() => {
    loadReunions();
    if (isDirecteur) {
      membreService.getAll().then(setMembres).catch(() => {});
    }
  }, [isDirecteur]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const created = await reunionService.create({
        ...form,
        dateReunion: form.dateReunion ? new Date(form.dateReunion).toISOString() : undefined,
        participantIds: selectedParticipants,
      });
      // add participants via the new endpoint
      for (const membreId of selectedParticipants) {
        await api.post(`/reunions/${created.id}/participants/${membreId}`).catch(() => {});
      }
      setForm({ titre: '', dateReunion: '', lieu: '', ordreJour: '' });
      setSelectedParticipants([]);
      setShowForm(false);
      await loadReunions();
    } finally {
      setCreating(false);
    }
  };

  const toggleParticipant = (id: number) => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Réunions</h1>
        {isDirecteur && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
          >
            <CalendarPlus size={16} /> Nouvelle réunion
          </button>
        )}
      </div>

      {/* Formulaire création — DIRECTEUR uniquement */}
      {isDirecteur && showForm && (
        <Card className="mb-6">
          <h2 className="font-semibold mb-4">Nouvelle réunion</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-3">
            <input required value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })}
              placeholder="Titre *" className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
            <input type="datetime-local" value={form.dateReunion} onChange={e => setForm({ ...form, dateReunion: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
            <input value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })}
              placeholder="Lieu" className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
            <textarea value={form.ordreJour} onChange={e => setForm({ ...form, ordreJour: e.target.value })}
              placeholder="Ordre du jour" className="md:col-span-3 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" rows={2} />

            <div className="md:col-span-3">
              <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Users size={14} /> Inviter des participants
              </p>
              <div className="max-h-36 overflow-y-auto border rounded-lg p-2 grid grid-cols-2 md:grid-cols-3 gap-1">
                {membres.map(m => (
                  <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                    <input type="checkbox" checked={selectedParticipants.includes(m.id)}
                      onChange={() => toggleParticipant(m.id)} className="rounded" />
                    {m.prenom} {m.nom}
                  </label>
                ))}
              </div>
              {selectedParticipants.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">{selectedParticipants.length} participant(s) sélectionné(s)</p>
              )}
            </div>

            <div className="md:col-span-3 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button type="submit" disabled={creating}
                className="bg-primary text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50 flex items-center gap-2">
                <CalendarPlus size={16} /> {creating ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Liste des réunions */}
      {reunions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <CalendarPlus size={48} className="mx-auto mb-3 opacity-30" />
          <p>Aucune réunion planifiée.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {reunions.map(reunion => (
            <Card key={reunion.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{reunion.titre}</h3>
                <Badge className={getStatutColor(reunion.statut)}>{reunion.statut}</Badge>
              </div>

              <p className="text-sm text-gray-500">{formatDateTime(reunion.dateReunion)}</p>

              {reunion.lieu && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={13} /> {reunion.lieu}
                </p>
              )}

              {reunion.ordreJour && (
                <p className="text-sm text-gray-600 mt-2 bg-gray-50 px-3 py-2 rounded-lg line-clamp-2">
                  {reunion.ordreJour}
                </p>
              )}

              {reunion.creePar && (
                <p className="text-xs text-gray-400 mt-2">
                  Créée par {(reunion.creePar as MembreResponse)?.prenom} {(reunion.creePar as MembreResponse)?.nom}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                <Link href={`/dashboard/reunions/${reunion.id}`}
                  className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
                  Voir détails <ArrowRight size={14} />
                </Link>
                {reunion.pvPath && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <FileText size={12} /> PV disponible
                  </span>
                )}
                {reunion.nbDocuments != null && reunion.nbDocuments > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <FileText size={12} /> {reunion.nbDocuments} doc(s)
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
