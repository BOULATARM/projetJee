import api from '@/lib/api';
import { Reunion } from '@/types';

export const reunionService = {
  getAll: async (): Promise<Reunion[]> => {
    const { data } = await api.get('/reunions');
    return data;
  },

  getById: async (id: number): Promise<Reunion> => {
    const { data } = await api.get(`/reunions/${id}`);
    return data;
  },

  create: async (dto: Record<string, unknown>): Promise<Reunion> => {
    const { data } = await api.post('/reunions', dto);
    return data;
  },

  marquerPresence: async (reunionId: number, membreId: number, present: boolean) => {
    await api.post(`/reunions/${reunionId}/presence/${membreId}`, null, { params: { present } });
  },
};
