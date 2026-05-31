import api from '@/lib/api';
import { RapportAnnuel } from '@/types';

export const rapportService = {
  getAll: async (): Promise<RapportAnnuel[]> => {
    const { data } = await api.get('/rapports');
    return data;
  },

  generer: async (annee: number): Promise<RapportAnnuel> => {
    const { data } = await api.post('/rapports/generer', null, { params: { annee } });
    return data;
  },

  exportPdf: async (id: number): Promise<Blob> => {
    const { data } = await api.get(`/rapports/${id}/export-pdf`, { responseType: 'blob' });
    return data;
  },
};
