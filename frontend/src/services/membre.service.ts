import api from '@/lib/api';
import { MembreResponse, MembreDetail } from '@/types';

export const membreService = {
  getAll: async (): Promise<MembreResponse[]> => {
    const { data } = await api.get('/membres');
    return data;
  },

  getById: async (id: number): Promise<MembreDetail> => {
    const { data } = await api.get(`/membres/${id}`);
    return data;
  },

  update: async (id: number, dto: Partial<MembreResponse>): Promise<MembreResponse> => {
    const { data } = await api.put(`/membres/${id}`, dto);
    return data;
  },

  search: async (q: string): Promise<MembreResponse[]> => {
    const { data } = await api.get('/membres/search', { params: { q } });
    return data;
  },

  getByEquipe: async (equipeId: number): Promise<MembreResponse[]> => {
    const { data } = await api.get(`/membres/equipe/${equipeId}`);
    return data;
  },

  changeStatut: async (id: number, statut: string) => {
    await api.put(`/membres/${id}/statut`, null, { params: { statut } });
  },
};
