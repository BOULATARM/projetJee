import api from '@/lib/api';
import { PublicationResponse } from '@/types';

export const publicationService = {
  getAll: async (): Promise<PublicationResponse[]> => {
    const { data } = await api.get('/publications');
    return data;
  },

  getById: async (id: number): Promise<PublicationResponse> => {
    const { data } = await api.get(`/publications/${id}`);
    return data;
  },

  create: async (dto: Record<string, unknown>): Promise<PublicationResponse> => {
    const { data } = await api.post('/publications', dto);
    return data;
  },

  update: async (id: number, dto: Record<string, unknown>): Promise<PublicationResponse> => {
    const { data } = await api.put(`/publications/${id}`, dto);
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/publications/${id}`);
  },

  getByMembre: async (membreId: number): Promise<PublicationResponse[]> => {
    const { data } = await api.get(`/publications/membre/${membreId}`);
    return data;
  },

  getByEquipe: async (equipeId: number): Promise<PublicationResponse[]> => {
    const { data } = await api.get(`/publications/equipe/${equipeId}`);
    return data;
  },

  getByAnnee: async (annee: number): Promise<PublicationResponse[]> => {
    const { data } = await api.get(`/publications/annee/${annee}`);
    return data;
  },
};
