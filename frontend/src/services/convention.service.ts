import api from '@/lib/api';
import { Convention } from '@/types';
import { toArray } from '@/lib/normalize';

export const conventionService = {
  getAll: async (): Promise<Convention[]> => {
    const { data } = await api.get('/conventions');
    return toArray<Convention>(data);
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
