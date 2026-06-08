'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { discussionService } from '@/services/discussion.service';
import { evenementService } from '@/services/evenement.service';
import api from '@/lib/api';
import { Discussion, Equipe, EvenementResponse, MembreResponse } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { ChevronDown, ChevronUp, MessageSquarePlus, Send } from 'lucide-react';
import { membreService } from '@/services/membre.service';
import { toArray } from '@/lib/normalize';

type ContextTab = 'equipe' | 'evenement' | 'membre';

export default function DiscussionsPage() {
  const [tab, setTab] = useState<ContextTab>('equipe');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [evenements, setEvenements] = useState<EvenementResponse[]>([]);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [contextId, setContextId] = useState('');
  const [form, setForm] = useState({ sujet: '', contenu: '' });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    api.get('/equipes').then(res => setEquipes(toArray(res.data))).catch(() => {});
    evenementService.getAll().then(setEvenements).catch(() => {});
    membreService.getAll().then(setMembres).catch(() => {});
  }, []);

  useEffect(() => {
    if (!contextId) return;
    const id = Number(contextId);
    const req = tab === 'equipe'
      ? discussionService.getByEquipe(id)
      : tab === 'evenement'
        ? discussionService.getByEvenement(id)
        : Promise.resolve<Discussion[]>([]);
    req.then(setDiscussions).catch(() => setDiscussions([]));
  }, [tab, contextId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!contextId && tab !== 'membre') return;
    await discussionService.create({
      ...form,
      equipeId: tab === 'equipe' ? Number(contextId) : undefined,
      evenementId: tab === 'evenement' ? Number(contextId) : undefined,
    });
    setForm({ sujet: '', contenu: '' });
    if (contextId) {
      const id = Number(contextId);
      const req = tab === 'equipe' ? discussionService.getByEquipe(id) : discussionService.getByEvenement(id);
      req.then(setDiscussions).catch(() => {});
    }
  };

  const handleReply = async (discussionId: number) => {
    if (!replyText.trim()) return;
    await discussionService.repondre(discussionId, replyText);
    setReplyText('');
    // Refresh replies — reload discussion
    if (contextId) {
      const id = Number(contextId);
      const req = tab === 'equipe' ? discussionService.getByEquipe(id) : discussionService.getByEvenement(id);
      req.then(setDiscussions).catch(() => {});
    }
  };

  const contextOptions = tab === 'equipe' ? equipes : tab === 'evenement' ? evenements : membres;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Discussions internes</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['equipe', 'evenement', 'membre'] as ContextTab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setContextId(''); setDiscussions([]); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'equipe' ? 'Par équipe' : t === 'evenement' ? 'Par événement' : 'Message direct'}
          </button>
        ))}
      </div>

      <Card className="mb-6">
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <select
            value={contextId}
            onChange={e => setContextId(e.target.value)}
            className="md:col-span-2 border rounded-lg px-3 py-2"
          >
            <option value="">
              {tab === 'equipe' ? 'Choisir une équipe' : tab === 'evenement' ? 'Choisir un événement' : 'Choisir un destinataire'}
            </option>
            {(contextOptions as (Equipe | EvenementResponse | MembreResponse)[]).map((option) => (
              <option key={option.id} value={option.id}>
                {'nom' in option ? option.nom : 'titre' in option ? option.titre : `${(option as MembreResponse).prenom} ${(option as MembreResponse).nom}`}
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <input required disabled={!contextId && tab !== 'membre'} value={form.sujet}
            onChange={e => setForm({ ...form, sujet: e.target.value })} placeholder="Sujet"
            className="border rounded-lg px-3 py-2 disabled:bg-gray-100" />
          <textarea required disabled={!contextId && tab !== 'membre'} value={form.contenu}
            onChange={e => setForm({ ...form, contenu: e.target.value })} placeholder="Message"
            className="border rounded-lg px-3 py-2 disabled:bg-gray-100" />
          <button disabled={!contextId && tab !== 'membre'}
            className="bg-primary text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 disabled:opacity-50">
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
                  {discussion.auteur ? `${discussion.auteur.prenom} ${discussion.auteur.nom}` : 'Auteur inconnu'} — {formatDateTime(discussion.dateCreation)}
                </p>
              </div>
              <button
                onClick={() => setExpandedId(expandedId === discussion.id ? null : discussion.id)}
                className="flex items-center gap-1 text-sm text-primary"
              >
                <Badge className="bg-blue-100 text-blue-800">{discussion.reponses?.length || 0} réponse(s)</Badge>
                {expandedId === discussion.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            <p className="text-sm text-gray-700 mt-3">{discussion.contenu}</p>

            {expandedId === discussion.id && (
              <div className="mt-4 border-t pt-3 space-y-3">
                {(discussion.reponses || []).map(r => (
                  <div key={r.id} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm">{r.contenu}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {r.auteur ? `${r.auteur.prenom} ${r.auteur.nom}` : ''} — {formatDateTime(r.dateCreation)}
                    </p>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Votre réponse..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    rows={2}
                  />
                  <button onClick={() => handleReply(discussion.id)}
                    className="bg-primary text-white px-3 py-2 rounded-lg self-end">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        ))}
        {!contextId && <p className="text-center text-gray-400 py-8">Choisissez un espace de discussion</p>}
        {contextId && discussions.length === 0 && <p className="text-center text-gray-400 py-8">Aucune discussion</p>}
      </div>
    </div>
  );
}
