'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { reunionService } from '@/services/reunion.service';
import { Reunion } from '@/types';
import { formatDateTime, getStatutColor } from '@/lib/utils';
import { CalendarPlus, MapPin } from 'lucide-react';

export default function ReunionsPage() {
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [form, setForm] = useState({ titre: '', dateReunion: '', lieu: '', ordreJour: '' });

  const loadReunions = () => reunionService.getAll().then(setReunions).catch(() => {});

  useEffect(() => {
    loadReunions();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await reunionService.create({ ...form, dateReunion: form.dateReunion ? new Date(form.dateReunion).toISOString() : undefined });
    setForm({ titre: '', dateReunion: '', lieu: '', ordreJour: '' });
    loadReunions();
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Reunions et PV</h1>

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-3">
          <input required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Titre" className="border rounded-lg px-3 py-2" />
          <input type="datetime-local" value={form.dateReunion} onChange={(e) => setForm({ ...form, dateReunion: e.target.value })} className="border rounded-lg px-3 py-2" />
          <input value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} placeholder="Lieu" className="border rounded-lg px-3 py-2" />
          <button className="bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2"><CalendarPlus size={18} /> Creer</button>
          <textarea value={form.ordreJour} onChange={(e) => setForm({ ...form, ordreJour: e.target.value })} placeholder="Ordre du jour" className="md:col-span-4 border rounded-lg px-3 py-2" />
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
          </Card>
        ))}
      </div>
    </div>
  );
}
