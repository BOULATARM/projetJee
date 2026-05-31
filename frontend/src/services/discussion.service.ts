import api from '@/lib/api';
import { Discussion, ReponseDiscussion } from '@/types';

export const discussionService = {
  getByEquipe: async (equipeId: number): Promise<Discussion[]> => {
    const { data } = await api.get(`/discussions/equipe/${equipeId}`);
    return data;
  },

  getByEvenement: async (evenementId: number): Promise<Discussion[]> => {
    const { data } = await api.get(`/discussions/evenement/${evenementId}`);
    return data;
  },

  create: async (dto: Record<string, unknown>): Promise<Discussion> => {
    const { data } = await api.post('/discussions', dto);
    return data;
  },

  repondre: async (discussionId: number, contenu: string): Promise<ReponseDiscussion> => {
    const { data } = await api.post(`/discussions/${discussionId}/reponses`, contenu, {
      headers: { 'Content-Type': 'text/plain' },
    });
    return data;
  },
};
