import api from '@/lib/api';
import { Convention } from '@/types';

export const conventionService = {
  getAll: async (): Promise<Convention[]> => {
    const { data } = await api.get('/conventions');
    return data;
  },

  getById: async (id: number): Promise<Convention> => {
    const { data } = await api.get(`/conventions/${id}`);
    return data;
  },

  create: async (dto: Record<string, unknown>): Promise<Convention> => {
    const { data } = await api.post('/conventions', dto);
    return data;
  },
};
