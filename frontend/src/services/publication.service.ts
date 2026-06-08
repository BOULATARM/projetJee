import api from '@/lib/api';
import { PublicationResponse } from '@/types';
import { toArray } from '@/lib/normalize';

export const publicationService = {
  getAll: async (): Promise<PublicationResponse[]> => {
    const { data } = await api.get('/publications');
    return toArray<PublicationResponse>(data);
  },

  getById: async (id: number): Promise<PublicationResponse> => {
    const { data } = await api.get(`/publications/${id}`);
    return data;
  },

  /** Créer une publication avec PDF obligatoire (multipart/form-data) */
  create: async (dto: Record<string, unknown>, fichierPdf: File): Promise<PublicationResponse> => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(dto));
    formData.append('fichierPdf', fichierPdf);
    const { data } = await api.post('/publications', formData);
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
    return toArray<PublicationResponse>(data);
  },

  getByEquipe: async (equipeId: number): Promise<PublicationResponse[]> => {
    const { data } = await api.get(`/publications/equipe/${equipeId}`);
    return toArray<PublicationResponse>(data);
  },

  getByAnnee: async (annee: number): Promise<PublicationResponse[]> => {
    const { data } = await api.get(`/publications/annee/${annee}`);
    return toArray<PublicationResponse>(data);
  },
};
