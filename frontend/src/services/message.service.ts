import api from '@/lib/api';
import { MessageResponse, MessageType, MembreResponse } from '@/types';

const BASE = '/messages';

export const messageService = {
  sendMessage: (data: {
    contenu?: string;
    type: MessageType;
    recipientId?: number;
    equipeId?: number;
    evenementId?: number;
    fichier?: File;
  }): Promise<MessageResponse> => {
    const fd = new FormData();
    if (data.contenu) fd.append('contenu', data.contenu);
    fd.append('type', data.type);
    if (data.recipientId) fd.append('recipientId', String(data.recipientId));
    if (data.equipeId) fd.append('equipeId', String(data.equipeId));
    if (data.evenementId) fd.append('evenementId', String(data.evenementId));
    if (data.fichier) fd.append('fichier', data.fichier);
    return api.post(BASE, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },

  getGlobal: (): Promise<MessageResponse[]> =>
    api.get(`${BASE}/global`).then(r => r.data),

  getTeam: (equipeId: number): Promise<MessageResponse[]> =>
    api.get(`${BASE}/team/${equipeId}`).then(r => r.data),

  getDirect: (otherId: number): Promise<MessageResponse[]> =>
    api.get(`${BASE}/direct/${otherId}`).then(r => r.data),

  getEventMessages: (evenementId: number): Promise<MessageResponse[]> =>
    api.get(`${BASE}/event/${evenementId}`).then(r => r.data),

  getMesEvenements: (): Promise<{ id: number; titre: string; statut: string }[]> =>
    api.get(`${BASE}/mes-evenements`).then(r => r.data),

  getConversations: (): Promise<MembreResponse[]> =>
    api.get(`${BASE}/conversations`).then(r => r.data),

  markRead: (otherId: number): Promise<void> =>
    api.put(`${BASE}/direct/${otherId}/read`).then(r => r.data),

  unreadCount: (): Promise<number> =>
    api.get(`${BASE}/unread-count`).then(r => r.data),
};
