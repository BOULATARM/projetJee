import api from '@/lib/api';
import { Notification } from '@/types';

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get('/notifications');
    return data;
  },

  getNonLues: async (): Promise<Notification[]> => {
    const { data } = await api.get('/notifications/non-lues');
    return data;
  },

  marquerLue: async (id: number) => {
    await api.put(`/notifications/${id}/lue`);
  },

  marquerToutesLues: async () => {
    await api.put('/notifications/marquer-toutes-lues');
  },
};
