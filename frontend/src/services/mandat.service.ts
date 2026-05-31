import api from '@/lib/api';
import { Mandat } from '@/types';

export const mandatService = {
  getActif: async (): Promise<Mandat> => {
    const { data } = await api.get('/mandats/actif');
    return data;
  },

  getHistorique: async (): Promise<Mandat[]> => {
    const { data } = await api.get('/mandats/historique');
    return data;
  },

  create: async (params: Record<string, unknown>): Promise<Mandat> => {
    const { data } = await api.post('/mandats', null, { params });
    return data;
  },

  cloturer: async (id: number, dateFin: string) => {
    await api.put(`/mandats/${id}/cloture`, null, { params: { dateFin } });
  },
};
