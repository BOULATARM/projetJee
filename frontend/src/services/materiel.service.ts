import api from '@/lib/api';
import { DistributionMateriel, Materiel, MaterielHistorique } from '@/types';
import { toArray } from '@/lib/normalize';

export const materielService = {
  getAll: async (): Promise<Materiel[]> => {
    const { data } = await api.get('/materiels');
    return toArray<Materiel>(data);
  },

  getStock: async (): Promise<Materiel[]> => {
    const { data } = await api.get('/materiels');
    return toArray<Materiel>(data);
  },

  getHistorique: async (): Promise<DistributionMateriel[]> => {
    const { data } = await api.get('/materiels/historique');
    return toArray<DistributionMateriel>(data);
  },

  getHistoriqueMateriel: async (id: number): Promise<MaterielHistorique[]> => {
    const { data } = await api.get(`/materiels/${id}/historique`);
    return toArray<MaterielHistorique>(data);
  },

  create: async (dto: Record<string, unknown>): Promise<Materiel> => {
    const { data } = await api.post('/materiels', dto);
    return data;
  },

  update: async (id: number, dto: Record<string, unknown>): Promise<Materiel> => {
    const { data } = await api.put(`/materiels/${id}`, dto);
    return data;
  },

  distribuer: async (dto: Record<string, unknown>) => {
    await api.post('/materiels/distribuer', dto);
  },
};
