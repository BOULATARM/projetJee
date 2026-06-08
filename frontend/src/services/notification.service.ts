import api from '@/lib/api';
import { Notification } from '@/types';
import { toArray } from '@/lib/normalize';

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get('/notifications');
    return toArray<Notification>(data);
  },

  getNonLues: async (): Promise<Notification[]> => {
    const { data } = await api.get('/notifications/non-lues');
    return toArray<Notification>(data);
  },

  marquerLue: async (id: number) => {
    await api.put(`/notifications/${id}/lue`);
  },

  marquerToutesLues: async () => {
    await api.put('/notifications/marquer-toutes-lues');
  },
};
