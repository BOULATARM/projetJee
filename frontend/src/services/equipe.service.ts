import api from '@/lib/api';
import { Equipe, MembreResponse } from '@/types';

export interface EquipeDetail extends Equipe {
  membres?: MembreResponse[];
}

export const equipeService = {
  getAll: (): Promise<Equipe[]> =>
    api.get('/equipes').then(r => Array.isArray(r.data) ? r.data : r.data.content ?? []),
  getById: (id: number): Promise<EquipeDetail> =>
    api.get(`/equipes/${id}`).then(r => r.data),
  getMembres: (id: number): Promise<MembreResponse[]> =>
    api.get(`/equipes/${id}/membres`).then(r => Array.isArray(r.data) ? r.data : r.data.content ?? []),
  delete: (id: number): Promise<void> =>
    api.delete(`/equipes/${id}`).then(() => {}),
};
