'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { discussionService } from '@/services/discussion.service';
import { evenementService } from '@/services/evenement.service';
import api from '@/lib/api';
import { Discussion, Equipe, EvenementResponse } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { MessageSquarePlus } from 'lucide-react';

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [evenements, setEvenements] = useState<EvenementResponse[]>([]);
  const [context, setContext] = useState({ type: 'equipe', id: '' });
  const [form, setForm] = useState({ sujet: '', contenu: '' });

  useEffect(() => {
    api.get('/equipes').then((res) => setEquipes(res.data)).catch(() => {});
    evenementService.getAll().then(setEvenements).catch(() => {});
  }, []);

  useEffect(() => {
    if (!context.id) return;
    const id = Number(context.id);
    const request = context.type === 'equipe'
      ? discussionService.getByEquipe(id)
      : discussionService.getByEvenement(id);
    request.then(setDiscussions).catch(() => setDiscussions([]));
  }, [context]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!context.id) return;
    await discussionService.create({
      ...form,
      equipeId: context.type === 'equipe' ? Number(context.id) : undefined,
      evenementId: context.type === 'evenement' ? Number(context.id) : undefined,
    });
    setForm({ sujet: '', contenu: '' });
    const id = Number(context.id);
    const updated = context.type === 'equipe'
      ? await discussionService.getByEquipe(id)
      : await discussionService.getByEvenement(id);
    setDiscussions(updated);
  };

  const options = context.type === 'equipe' ? equipes : evenements;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Discussions internes</h1>

      <Card className="mb-6">
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <select value={context.type} onChange={(e) => setContext({ type: e.target.value, id: '' })} className="border rounded-lg px-3 py-2">
            <option value="equipe">Par equipe</option>
            <option value="evenement">Par evenement</option>
          </select>
          <select value={context.id} onChange={(e) => setContext({ ...context, id: e.target.value })} className="md:col-span-2 border rounded-lg px-3 py-2">
            <option value="">Choisir un espace</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {'nom' in option ? option.nom : option.titre}
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <input required disabled={!context.id} value={form.sujet} onChange={(e) => setForm({ ...form, sujet: e.target.value })} placeholder="Sujet" className="border rounded-lg px-3 py-2 disabled:bg-gray-100" />
          <textarea required disabled={!context.id} value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} placeholder="Message" className="border rounded-lg px-3 py-2 disabled:bg-gray-100" />
          <button disabled={!context.id} className="bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 disabled:opacity-50">
            <MessageSquarePlus size={18} /> Publier
          </button>
        </form>
      </Card>

      <div className="space-y-4">
        {discussions.map((discussion) => (
          <Card key={discussion.id}>
            <div className="flex justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-800">{discussion.sujet}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {discussion.auteur ? `${discussion.auteur.prenom} ${discussion.auteur.nom}` : 'Auteur inconnu'} - {formatDateTime(discussion.dateCreation)}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">{discussion.reponses?.length || 0} reponses</Badge>
            </div>
            <p className="text-sm text-gray-700 mt-3">{discussion.contenu}</p>
          </Card>
        ))}
        {!context.id && <p className="text-center text-gray-400 py-8">Choisissez une equipe ou un evenement</p>}
        {context.id && discussions.length === 0 && <p className="text-center text-gray-400 py-8">Aucune discussion</p>}
      </div>
    </div>
  );
}
