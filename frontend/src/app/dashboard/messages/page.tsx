'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { messageService } from '@/services/message.service';
import { membreService } from '@/services/membre.service';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { MessageResponse, MessageType, MembreResponse, Equipe } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import {
  Send, Paperclip, Globe, Users, MessageSquare, X, FileText, Film, Image as ImageIcon, File as FileIcon,
  Mic, MicOff, Square, Calendar,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const FILE_BASE = API_BASE.replace('/api/v1', '');

type Tab = 'global' | 'team' | 'direct' | 'event';

interface EvenementItem { id: number; titre: string; statut: string; }

function fileIcon(type?: string) {
  if (!type) return <FileIcon size={16} />;
  if (type.startsWith('image/')) return <ImageIcon size={16} />;
  if (type.startsWith('video/')) return <Film size={16} />;
  if (type.startsWith('audio/')) return <Mic size={16} />;
  return <FileIcon size={16} />;
}

function FilePreview({ url, nom, type, isMe }: { url: string; nom?: string; type?: string; isMe?: boolean }) {
  const src = url.startsWith('http') ? url : `${FILE_BASE}/uploads/${url.replace(/^\/?uploads\//, '')}`;
  if (type?.startsWith('image/')) {
    return <img src={src} alt={nom} className="max-h-48 rounded-lg mt-1 border" />;
  }
  if (type?.startsWith('video/')) {
    return <video src={src} controls className="max-h-48 rounded-lg mt-1 border w-full max-w-xs" />;
  }
  if (type?.startsWith('audio/')) {
    return (
      <div className="mt-1">
        <audio src={src} controls className="h-9 w-56 rounded-lg" />
      </div>
    );
  }
  return (
    <a href={src} target="_blank" rel="noopener noreferrer"
      className={`flex items-center gap-2 text-sm underline mt-1 ${isMe ? 'text-white' : 'text-primary'}`}>
      {fileIcon(type)} {nom || 'Fichier'}
    </a>
  );
}

function MessageBubble({ msg, meId }: { msg: MessageResponse; meId: number }) {
  const isMe = msg.sender.id === meId;
  return (
    <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
      <Avatar photo={msg.sender.photo} nom={msg.sender.nom} prenom={msg.sender.prenom} size={32} />
      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isMe && (
          <span className="text-xs text-gray-500 mb-0.5">
            {msg.sender.prenom} {msg.sender.nom}
          </span>
        )}
        <div className={`rounded-2xl px-3 py-2 text-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
          {msg.contenu && <p className="whitespace-pre-wrap">{msg.contenu}</p>}
          {msg.fichierUrl && <FilePreview url={msg.fichierUrl} nom={msg.fichierNom} type={msg.fichierType} isMe={isMe} />}
        </div>
        <span className="text-xs text-gray-400 mt-0.5">
          {new Date(msg.dateEnvoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { membreId } = useAuthStore();
  const meId = membreId ?? 0;

  const [tab, setTab] = useState<Tab>('global');
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [membres, setMembres] = useState<MembreResponse[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [evenements, setEvenements] = useState<EvenementItem[]>([]);
  const [conversations, setConversations] = useState<MembreResponse[]>([]);

  const [selectedEquipeId, setSelectedEquipeId] = useState<number | null>(null);
  const [selectedEvenementId, setSelectedEvenementId] = useState<number | null>(null);
  const [selectedMembre, setSelectedMembre] = useState<MembreResponse | null>(null);

  const [contenu, setContenu] = useState('');
  const [fichier, setFichier] = useState<File | null>(null);
  const [fichierPreview, setFichierPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [newDirectId, setNewDirectId] = useState<number | ''>('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // chargement initial
  useEffect(() => {
    membreService.getAll().then(setMembres).catch(() => {});
    api.get('/equipes/mes-equipes').then(r => setEquipes(r.data)).catch(() => {});
    messageService.getConversations().then(setConversations).catch(() => {});
    messageService.getMesEvenements().then(setEvenements).catch(() => {});
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      if (tab === 'global') {
        setMessages(await messageService.getGlobal());
      } else if (tab === 'team' && selectedEquipeId) {
        setMessages(await messageService.getTeam(selectedEquipeId));
      } else if (tab === 'direct' && selectedMembre) {
        const msgs = await messageService.getDirect(selectedMembre.id);
        setMessages(msgs);
        messageService.markRead(selectedMembre.id).catch(() => {});
      } else if (tab === 'event' && selectedEvenementId) {
        setMessages(await messageService.getEventMessages(selectedEvenementId));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, [tab, selectedEquipeId, selectedMembre, selectedEvenementId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFichier = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFichier(f);
    if (f && f.type.startsWith('image/')) {
      const r = new FileReader();
      r.onloadend = () => setFichierPreview(r.result as string);
      r.readAsDataURL(f);
    } else {
      setFichierPreview(null);
    }
  };

  const handleSend = async () => {
    if (!contenu.trim() && !fichier) return;
    setSending(true);
    try {
      const type = tab === 'global' ? MessageType.GLOBAL
        : tab === 'team' ? MessageType.TEAM
        : tab === 'event' ? MessageType.EVENT
        : MessageType.DIRECT;

      await messageService.sendMessage({
        contenu: contenu.trim() || undefined,
        type,
        equipeId: tab === 'team' && selectedEquipeId ? selectedEquipeId : undefined,
        recipientId: tab === 'direct' && selectedMembre ? selectedMembre.id : undefined,
        evenementId: tab === 'event' && selectedEvenementId ? selectedEvenementId : undefined,
        fichier: fichier ?? undefined,
      });
      setContenu('');
      setFichier(null);
      setFichierPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadMessages();
      if (tab === 'direct' && selectedMembre) {
        const alreadyIn = conversations.some(c => c.id === selectedMembre.id);
        if (!alreadyIn) setConversations(prev => [selectedMembre, ...prev]);
      }
    } finally {
      setSending(false);
    }
  };

  const startNewDirect = () => {
    if (!newDirectId) return;
    const m = membres.find(x => x.id === Number(newDirectId));
    if (!m) return;
    setSelectedMembre(m);
    setTab('direct');
    setNewDirectId('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordSecs(0);
      timerRef.current = setInterval(() => setRecordSecs(s => s + 1), 1000);
    } catch {
      alert('Accès au microphone refusé.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const cancelAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const sendAudio = async () => {
    if (!audioBlob) return;
    setSending(true);
    try {
      const ext = audioBlob.type.includes('webm') ? 'webm' : 'ogg';
      const audioFile = new File([audioBlob], `audio_${Date.now()}.${ext}`, { type: audioBlob.type });
      const type = tab === 'global' ? MessageType.GLOBAL
        : tab === 'team' ? MessageType.TEAM
        : tab === 'event' ? MessageType.EVENT
        : MessageType.DIRECT;
      await messageService.sendMessage({
        type,
        equipeId: tab === 'team' && selectedEquipeId ? selectedEquipeId : undefined,
        recipientId: tab === 'direct' && selectedMembre ? selectedMembre.id : undefined,
        evenementId: tab === 'event' && selectedEvenementId ? selectedEvenementId : undefined,
        fichier: audioFile,
      });
      cancelAudio();
      await loadMessages();
    } finally {
      setSending(false);
    }
  };

  const fmtSecs = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const canSend = tab === 'global'
    || (tab === 'team' && selectedEquipeId !== null)
    || (tab === 'direct' && selectedMembre !== null)
    || (tab === 'event' && selectedEvenementId !== null);

  const selectedEvenement = evenements.find(e => e.id === selectedEvenementId);

  return (
    <div className="h-[calc(100vh-80px)] flex gap-4 p-4">

      {/* ── Sidebar gauche ─────────────────────────────────────── */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2">

        {/* Canal global */}
        <button
          onClick={() => { setTab('global'); setSelectedEquipeId(null); setSelectedMembre(null); setSelectedEvenementId(null); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
            ${tab === 'global' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}
        >
          <Globe size={18} /> Tout le laboratoire
        </button>

        {/* Équipes */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b flex items-center gap-2">
            <Users size={14} /> Équipes
          </div>
          {equipes.length === 0 && (
            <p className="px-4 py-3 text-xs text-gray-400">Aucune équipe</p>
          )}
          {equipes.map(eq => (
            <button key={eq.id}
              onClick={() => { setTab('team'); setSelectedEquipeId(eq.id); setSelectedMembre(null); setSelectedEvenementId(null); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center gap-2
                ${tab === 'team' && selectedEquipeId === eq.id ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              <Users size={14} />
              <span className="truncate">{eq.nom}</span>
            </button>
          ))}
        </div>

        {/* Discussions événements */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b flex items-center gap-2">
            <Calendar size={14} /> Événements
          </div>
          {evenements.length === 0 && (
            <p className="px-4 py-3 text-xs text-gray-400">Aucun événement</p>
          )}
          {evenements.map(ev => (
            <button key={ev.id}
              onClick={() => { setTab('event'); setSelectedEvenementId(ev.id); setSelectedMembre(null); setSelectedEquipeId(null); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center gap-2
                ${tab === 'event' && selectedEvenementId === ev.id ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              <Calendar size={14} className="shrink-0" />
              <span className="truncate">{ev.titre}</span>
            </button>
          ))}
        </div>

        {/* Messages directs */}
        <div className="bg-white border rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b flex items-center gap-2">
            <MessageSquare size={14} /> Messages directs
          </div>

          {/* Nouvelle conversation */}
          <div className="px-3 py-2 border-b flex gap-2">
            <select
              value={newDirectId}
              onChange={e => setNewDirectId(e.target.value === '' ? '' : Number(e.target.value))}
              className="flex-1 text-xs border rounded px-2 py-1 min-w-0"
            >
              <option value="">Nouveau message…</option>
              {membres.filter(m => m.id !== meId).map(m => (
                <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
              ))}
            </select>
            <button onClick={startNewDirect}
              className="text-primary hover:text-blue-700 text-xs font-medium px-1">
              OK
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 && (
              <p className="px-4 py-3 text-xs text-gray-400">Aucune conversation</p>
            )}
            {conversations.map(m => (
              <button key={m.id}
                onClick={() => { setTab('direct'); setSelectedMembre(m); setSelectedEquipeId(null); setSelectedEvenementId(null); }}
                className={`w-full text-left px-3 py-2.5 text-sm transition flex items-center gap-2
                  ${tab === 'direct' && selectedMembre?.id === m.id ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <Avatar photo={m.photo} nom={m.nom} prenom={m.prenom} size={28} />
                <span className="truncate">{m.prenom} {m.nom}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Zone de chat ────────────────────────────────────────── */}
      <Card className="flex-1 flex flex-col min-w-0 overflow-hidden p-0">

        {/* En-tête */}
        <div className="px-5 py-3 border-b flex items-center gap-3 bg-gray-50 rounded-t-xl flex-shrink-0">
          {tab === 'global' && <><Globe size={18} className="text-primary" /><span className="font-medium">Tout le laboratoire</span></>}
          {tab === 'team' && selectedEquipeId && (
            <><Users size={18} className="text-primary" />
            <span className="font-medium">{equipes.find(e => e.id === selectedEquipeId)?.nom ?? 'Équipe'}</span></>
          )}
          {tab === 'team' && !selectedEquipeId && <span className="text-gray-400 text-sm">Sélectionnez une équipe</span>}
          {tab === 'event' && selectedEvenement && (
            <>
              <Calendar size={18} className="text-primary" />
              <div>
                <span className="font-medium">{selectedEvenement.titre}</span>
                <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Discussion privée · participants</span>
              </div>
            </>
          )}
          {tab === 'event' && !selectedEvenementId && <span className="text-gray-400 text-sm">Sélectionnez un événement</span>}
          {tab === 'direct' && selectedMembre && (
            <><Avatar photo={selectedMembre.photo} nom={selectedMembre.nom} prenom={selectedMembre.prenom} size={28} />
            <span className="font-medium">{selectedMembre.prenom} {selectedMembre.nom}</span></>
          )}
          {tab === 'direct' && !selectedMembre && <span className="text-gray-400 text-sm">Sélectionnez un membre</span>}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={40} className="mb-2 opacity-30" />
              <p className="text-sm">Aucun message — soyez le premier !</p>
            </div>
          )}
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} meId={meId} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Zone de saisie */}
        {canSend && (
          <div className="px-4 py-3 border-t bg-gray-50 rounded-b-xl flex-shrink-0">
            {fichier && (
              <div className="mb-2 flex items-center gap-2 bg-white border rounded-lg px-3 py-2 text-sm">
                {fichier.type.startsWith('image/') && fichierPreview
                  ? <img src={fichierPreview} className="h-10 w-10 rounded object-cover" alt="" />
                  : fileIcon(fichier.type)}
                <span className="flex-1 truncate text-gray-700">{fichier.name}</span>
                <button onClick={() => { setFichier(null); setFichierPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                  <X size={16} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
            )}

            {audioUrl && (
              <div className="mb-2 flex items-center gap-2 bg-white border border-red-200 rounded-xl px-3 py-2">
                <Mic size={16} className="text-red-500 shrink-0" />
                <audio src={audioUrl} controls className="h-8 flex-1" />
                <button onClick={cancelAudio} title="Annuler">
                  <X size={16} className="text-gray-400 hover:text-red-500" />
                </button>
                <button
                  onClick={sendAudio}
                  disabled={sending}
                  className="p-1.5 rounded-lg bg-primary text-white hover:bg-blue-700 disabled:opacity-40"
                  title="Envoyer l'audio">
                  <Send size={15} />
                </button>
              </div>
            )}

            {recording && (
              <div className="mb-2 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-red-600 font-medium">Enregistrement en cours…</span>
                <span className="text-sm text-red-500 font-mono ml-auto">{fmtSecs(recordSecs)}</span>
                <button
                  onClick={stopRecording}
                  className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  title="Arrêter l'enregistrement">
                  <Square size={14} />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <textarea
                value={contenu}
                onChange={e => setContenu(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Votre message… (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
                rows={1}
                className="flex-1 resize-none border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white max-h-32 overflow-y-auto"
                style={{ minHeight: '42px' }}
              />
              <input ref={fileInputRef} type="file" className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                onChange={handleFichier} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl border bg-white hover:bg-gray-100 text-gray-500"
                title="Joindre un fichier">
                <Paperclip size={18} />
              </button>
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={!!audioUrl}
                className={`p-2.5 rounded-xl border transition ${
                  recording
                    ? 'bg-red-500 text-white border-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-white hover:bg-gray-100 text-gray-500 disabled:opacity-40'
                }`}
                title={recording ? "Arrêter l'enregistrement" : 'Enregistrer un audio'}>
                {recording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                onClick={handleSend}
                disabled={sending || (!contenu.trim() && !fichier)}
                className="p-2.5 rounded-xl bg-primary text-white hover:bg-blue-700 disabled:opacity-40 transition">
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {!canSend && (
          <div className="px-4 py-3 text-center text-sm text-gray-400 border-t bg-gray-50 rounded-b-xl">
            Sélectionnez un canal pour écrire un message
          </div>
        )}
      </Card>
    </div>
  );
}
