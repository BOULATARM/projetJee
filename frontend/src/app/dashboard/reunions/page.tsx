'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { reunionService } from '@/services/reunion.service';
import { membreService } from '@/services/membre.service';
import { MembreResponse, Reunion } from '@/types';
import { formatDateTime, getStatutColor } from '@/lib/utils';
import { CalendarPlus, Download, MapPin, Upload, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function ReunionsPage() {
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [form, setForm] = useState({ titre: '', dateReunion: '', lieu: '', ordreJour: '', compteRendu: '' });
  const [uploadingPV, setUploadingPV] = useState<number | null>(null);

  const loadReunions = () => reunionService.getAll().then(setReunions).catch(() => {});

  useEffect(() => {
    loadReunions();
    membreService.getAll().then(setMembres).catch(() => {});
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const created = await reunionService.create({
      ...form,
      dateReunion: form.dateReunion ? new Date(form.dateReunion).toISOString() : undefined,
    });
    // Add participants
    for (const membreId of selectedParticipants) {
      await api.post(`/reunions/${created.id}/presence/${membreId}`, null, { params: { present: true } }).catch(() => {});
    }
    setForm({ titre: '', dateReunion: '', lieu: '', ordreJour: '', compteRendu: '' });
    setSelectedParticipants([]);
    loadReunions();
  };

  const toggleParticipant = (id: number) => {
    setSelectedParticipants(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleUploadPV = async (reunionId: number, file: File) => {
    setUploadingPV(reunionId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/reunions/${reunionId}/pv`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      loadReunions();
    } finally {
      setUploadingPV(null);
    }
  };

  const handleDownloadPV = async (reunionId: number) => {
    const response = await api.get(`/reunions/${reunionId}/pv`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const link = window.document.createElement('a');
    link.href = url; link.download = `pv-reunion-${reunionId}.pdf`; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Réunions et PV</h1>

      <Card className="mb-6">
        <h2 className="font-semibold mb-4">Nouvelle réunion</h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-3">
          <input required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Titre *" className="border rounded-lg px-3 py-2" />
          <input type="datetime-local" value={form.dateReunion} onChange={(e) => setForm({ ...form, dateReunion: e.target.value })} className="border rounded-lg px-3 py-2" />
          <input value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} placeholder="Lieu" className="border rounded-lg px-3 py-2" />
          <textarea value={form.ordreJour} onChange={(e) => setForm({ ...form, ordreJour: e.target.value })} placeholder="Ordre du jour" className="md:col-span-3 border rounded-lg px-3 py-2" rows={2} />
          <textarea value={form.compteRendu} onChange={(e) => setForm({ ...form, compteRendu: e.target.value })} placeholder="Compte rendu (optionnel)" className="md:col-span-3 border rounded-lg px-3 py-2" rows={2} />
          <div className="md:col-span-3">
            <p className="text-sm text-gray-600 mb-1">Participants</p>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 grid grid-cols-2 gap-1">
              {membres.map(m => (
                <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={selectedParticipants.includes(m.id)} onChange={() => toggleParticipant(m.id)} className="rounded" />
                  {m.prenom} {m.nom}
                </label>
              ))}
            </div>
          </div>
          <button className="md:col-span-3 bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2">
            <CalendarPlus size={18} /> Créer
          </button>
        </form>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {reunions.map((reunion) => (
          <Card key={reunion.id}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-800">{reunion.titre}</h3>
              <Badge className={getStatutColor(reunion.statut)}>{reunion.statut}</Badge>
            </div>
            <p className="text-sm text-gray-500">{formatDateTime(reunion.dateReunion)}</p>
            {reunion.lieu && <p className="text-sm text-gray-500 flex items-center gap-2 mt-2"><MapPin size={16} /> {reunion.lieu}</p>}
            {reunion.ordreJour && <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-3 rounded-lg">{reunion.ordreJour}</p>}
            {reunion.createur && (
              <p className="text-xs text-gray-400 mt-2">Créée par {reunion.createur.prenom} {reunion.createur.nom}</p>
            )}
            <Link href={`/dashboard/reunions/${reunion.id}`} className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Voir détails <ArrowRight size={14} />
            </Link>
            {reunion.participants && (reunion.participants as unknown[]).length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{(reunion.participants as unknown[]).length} participant(s)</p>
            )}

            {/* PV actions */}
            <div className="flex items-center gap-3 mt-3 border-t pt-3">
              <label className="flex items-center gap-1 text-sm text-primary cursor-pointer hover:underline">
                <Upload size={14} />
                {uploadingPV === reunion.id ? 'Upload...' : 'Upload PV'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleUploadPV(reunion.id, e.target.files[0]); }}
                />
              </label>
              {reunion.pvPath && (
                <button onClick={() => handleDownloadPV(reunion.id)} className="flex items-center gap-1 text-sm text-green-600 hover:underline">
                  <Download size={14} /> Télécharger le PV
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
