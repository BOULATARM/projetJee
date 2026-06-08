import api from '@/lib/api';
import { DemandeMateriel } from '@/types';
import { toArray } from '@/lib/normalize';

export const demandeMaterielService = {
  getAll: async (): Promise<DemandeMateriel[]> => {
    const { data } = await api.get('/demandes-materiel');
    return toArray<DemandeMateriel>(data);
  },

  getMesDemandes: async (): Promise<DemandeMateriel[]> => {
    const { data } = await api.get('/demandes-materiel/mes-demandes');
    return toArray<DemandeMateriel>(data);
  },

  create: async (dto: Record<string, unknown>): Promise<DemandeMateriel> => {
    const { data } = await api.post('/demandes-materiel', dto);
    return data;
  },

  valider: async (id: number) => {
    await api.put(`/demandes-materiel/${id}/valider`);
  },

  refuser: async (id: number) => {
    await api.put(`/demandes-materiel/${id}/refuser`);
  },
};
