import api from '@/lib/api';
import { Equipe } from '@/types';

export const equipeService = {
  getAll: (): Promise<Equipe[]> =>
    api.get('/equipes').then(r => Array.isArray(r.data) ? r.data : r.data.content ?? []),
  delete: (id: number): Promise<void> =>
    api.delete(`/equipes/${id}`).then(() => {}),
};
