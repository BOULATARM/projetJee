import api from '@/lib/api';
import { DashboardStats } from '@/types';

export const statsService = {
  getDashboard: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/stats/dashboard');
    return data;
  },
};
