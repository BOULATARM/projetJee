import api from '@/lib/api';
import { Laboratoire } from '@/types';

export interface LaboratoireRequest {
  nom: string;
  acronyme?: string;
  description?: string;
  adresse?: string;
  dateCreation?: string;
  axesDeRecherche?: string;
}

export interface LaboratoireAuditLog {
  id: number;
  action: string;
  utilisateur: string;
  nomComplet?: string;
  date: string;
  details?: string;
}

export const laboratoireService = {
  get: (): Promise<Laboratoire> =>
    api.get('/laboratoire').then(r => r.data),

  update: (data: LaboratoireRequest): Promise<Laboratoire> =>
    api.put('/laboratoire', data).then(r => r.data),

  getHistorique: (): Promise<LaboratoireAuditLog[]> =>
    api.get('/laboratoire/historique').then(r => r.data),
};
