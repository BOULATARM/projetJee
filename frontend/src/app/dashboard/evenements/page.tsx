'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStatutColor, formatDate } from '@/lib/utils';
import { evenementService } from '@/services/evenement.service';
import { EvenementResponse, TypeEvenement, RoleSysteme } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { CalendarDays, FileText, MapPin, PlusCircle, Users, X } from 'lucide-react';
import Link from 'next/link';

const TYPES_EVT: TypeEvenement[] = [TypeEvenement.CONFERENCE, TypeEvenement.SEMINAIRE, TypeEvenement.WORKSHOP, TypeEvenement.JOURNEE_ETUDE, TypeEvenement.REUNION];

export default function EvenementsPage() {
  const [evenements, setEvenements] = useState<EvenementResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titre: '', description: '', type: TypeEvenement.CONFERENCE,
    dateDebut: '', dateFin: '', lieu: '', edition: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { role } = useAuthStore();

  const canCreate = role === RoleSysteme.ADMIN || role === RoleSysteme.DIRECTEUR;

  const load = () => evenementService.getAll().then(setEvenements).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await evenementService.create({
        titre: form.titre,
        description: form.description,
        type: form.type,
        dateDebut: form.dateDebut ? new Date(form.dateDebut).toISOString() : undefined,
        dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : undefined,
        lieu: form.lieu,
        edition: form.edition ? Number(form.edition) : undefined,
      });
      setForm({ titre: '', description: '', type: TypeEvenement.CONFERENCE, dateDebut: '', dateFin: '', lieu: '', edition: '' });
      setShowForm(false);
      load();
    } catch {
      setError('Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Événements</h1>
        {canCreate && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            {showForm ? <X size={18} /> : <PlusCircle size={18} />}
            {showForm ? 'Annuler' : 'Créer un événement'}
          </button>
        )}
      </div>

      {showForm && canCreate && (
        <Card className="mb-6 border-l-4 border-primary">
          <h2 className="font-semibold text-gray-700 mb-4">Nouvel événement</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <input required value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })}
                placeholder="Titre *" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Type *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as TypeEvenement })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none">
                {TYPES_EVT.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <input value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })}
                placeholder="Lieu" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Date début *</label>
              <input required type="datetime-local" value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Date fin</label>
              <input type="datetime-local" value={form.dateFin} onChange={e => setForm({ ...form, dateFin: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <input type="number" min={1} value={form.edition} onChange={e => setForm({ ...form, edition: e.target.value })}
                placeholder="Édition (numéro)" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="md:col-span-2">
              <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Description" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            {error && <p className="md:col-span-2 text-red-500 text-sm">{error}</p>}
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-2 rounded-lg disabled:opacity-50">
                {saving ? 'Enregistrement...' : 'Créer'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evenements.map((e) => (
          <Link key={e.id} href={`/dashboard/evenements/${e.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex justify-between items-start mb-3">
                <Badge className={getStatutColor(e.statut)}>{e.statut}</Badge>
                <Badge className="bg-purple-100 text-purple-800">{e.type}</Badge>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{e.titre}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{e.description}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span>{formatDate(e.dateDebut)}</span>
                </div>
                {e.lieu && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{e.lieu}</span>
                  </div>
                )}
                {e.edition && <p className="text-xs text-gray-400">Édition {e.edition}</p>}
                {e.organisateurs?.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Users size={14} className="text-gray-400" />
                    {e.organisateurs.slice(0, 2).map(o => (
                      <span key={o.id} className="text-xs bg-gray-100 px-1 rounded">{o.prenom} {o.nom}</span>
                    ))}
                    {e.organisateurs.length > 2 && <span className="text-xs text-gray-400">+{e.organisateurs.length - 2}</span>}
                  </div>
                )}
                {e.nbDocuments > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText size={14} className="text-blue-400" />
                    <span className="text-xs text-blue-600">{e.nbDocuments} document(s)</span>
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
        {evenements.length === 0 && (
          <p className="col-span-3 text-center text-gray-400 py-8">Aucun événement</p>
        )}
      </div>
    </div>
  );
}
