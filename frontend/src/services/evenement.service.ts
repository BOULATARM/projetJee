import api from '@/lib/api';
import { EvenementResponse } from '@/types';
import { toArray } from '@/lib/normalize';

export const evenementService = {
  getAll: async (): Promise<EvenementResponse[]> => {
    const { data } = await api.get('/evenements');
    return toArray<EvenementResponse>(data);
  },

  getById: async (id: number): Promise<EvenementResponse> => {
    const { data } = await api.get(`/evenements/${id}`);
    return data;
  },

  create: async (dto: Record<string, unknown>): Promise<EvenementResponse> => {
    const { data } = await api.post('/evenements', dto);
    return data;
  },

  update: async (id: number, dto: Record<string, unknown>): Promise<EvenementResponse> => {
    const { data } = await api.put(`/evenements/${id}`, dto);
    return data;
  },

  getCalendrier: async (debut: string, fin: string): Promise<EvenementResponse[]> => {
    const { data } = await api.get('/evenements/calendrier', { params: { debut, fin } });
    return toArray<EvenementResponse>(data);
  },
};
