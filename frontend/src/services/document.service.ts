import api from '@/lib/api';
import { Document } from '@/types';

export const documentService = {
  getAll: async (): Promise<Document[]> => {
    const { data } = await api.get('/documents');
    return data;
  },

  upload: async (file: File, dto: Record<string, unknown>): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    const { data } = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getByEvenement: async (evenementId: number): Promise<Document[]> => {
    const { data } = await api.get(`/documents/evenement/${evenementId}`);
    return data;
  },

  getByReunion: async (reunionId: number): Promise<Document[]> => {
    const { data } = await api.get(`/documents/reunion/${reunionId}`);
    return data;
  },

  getByConvention: async (conventionId: number): Promise<Document[]> => {
    const { data } = await api.get(`/documents/convention/${conventionId}`);
    return data;
  },

  download: async (id: number): Promise<Blob> => {
    const { data } = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/documents/${id}`);
  },
};
