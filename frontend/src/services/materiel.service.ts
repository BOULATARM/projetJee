import api from '@/lib/api';
import { DistributionMateriel, Materiel } from '@/types';

export const materielService = {
  getAll: async (): Promise<Materiel[]> => {
    const { data } = await api.get('/materiels');
    return data;
  },

  getStock: async (): Promise<Materiel[]> => {
    const { data } = await api.get('/materiels/stock');
    return data;
  },

  getHistorique: async (): Promise<DistributionMateriel[]> => {
    const { data } = await api.get('/materiels/historique');
    return data;
  },

  create: async (dto: Record<string, unknown>): Promise<Materiel> => {
    const { data } = await api.post('/materiels', dto);
    return data;
  },

  distribuer: async (dto: Record<string, unknown>) => {
    await api.post('/materiels/distribuer', dto);
  },
};
