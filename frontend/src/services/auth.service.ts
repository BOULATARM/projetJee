import api from '@/lib/api';
import { AuthResponse, MembreResponse } from '@/types';

export const authService = {
  login: async (email: string, motDePasse: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, motDePasse });
    return data;
  },

  getCurrentUser: async (): Promise<MembreResponse> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
