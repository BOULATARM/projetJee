import api from '@/lib/api';
import { Mandat } from '@/types';

export interface MandatAudit {
  id: number;
  action: string;
  utilisateur: string;
  date: string;
  details: string;
}

export const mandatService = {
  getActif: async (): Promise<Mandat | null> => {
    try {
      const { data } = await api.get('/mandats/actif');
      return data ?? null;
    } catch {
      return null;
    }
  },

  getHistorique: async (): Promise<Mandat[]> => {
    const { data } = await api.get('/mandats/historique');
    return Array.isArray(data) ? data : [];
  },

  getAudit: async (): Promise<MandatAudit[]> => {
    try {
      const { data } = await api.get('/mandats/audit');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  create: async (params: Record<string, unknown>): Promise<Mandat> => {
    const { data } = await api.post('/mandats', null, { params });
    return data;
  },

  cloturer: async (id: number) => {
    await api.put(`/mandats/${id}/cloture`);
  },
};
