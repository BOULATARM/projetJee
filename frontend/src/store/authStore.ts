import { create } from 'zustand';
import { AuthResponse, RoleSysteme, StatutMembre } from '@/types';

interface AuthState {
  token: string | null;
  membreId: number | null;
  email: string | null;
  role: RoleSysteme | null;
  statut: StatutMembre | null;
  nom: string | null;
  prenom: string | null;
  photo: string | null;
  isAuthenticated: boolean;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

const getInitialState = () => {
  if (typeof window === 'undefined') return { isAuthenticated: false, token: null, membreId: null, email: null, role: null, statut: null, nom: null, prenom: null, photo: null };
  const token = localStorage.getItem('token');
  if (!token) return { isAuthenticated: false, token: null, membreId: null, email: null, role: null, statut: null, nom: null, prenom: null, photo: null };
  return {
    token,
    membreId: Number(localStorage.getItem('membreId')),
    email: localStorage.getItem('email'),
    role: localStorage.getItem('role') as RoleSysteme,
    statut: (localStorage.getItem('statut') as StatutMembre) || null,
    nom: localStorage.getItem('nom'),
    prenom: localStorage.getItem('prenom'),
    photo: localStorage.getItem('photo'),
    isAuthenticated: true,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  setAuth: (auth: AuthResponse) => {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('membreId', String(auth.membreId));
    localStorage.setItem('email', auth.email);
    localStorage.setItem('role', auth.role);
    if (auth.statut) localStorage.setItem('statut', auth.statut);
    localStorage.setItem('nom', auth.nom);
    localStorage.setItem('prenom', auth.prenom);
    if (auth.photo) localStorage.setItem('photo', auth.photo);
    set({
      token: auth.token,
      membreId: auth.membreId,
      email: auth.email,
      role: auth.role,
      statut: auth.statut || null,
      nom: auth.nom,
      prenom: auth.prenom,
      photo: auth.photo || null,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.clear();
    set({
      token: null, membreId: null, email: null, role: null,
      statut: null, nom: null, prenom: null, photo: null,
      isAuthenticated: false,
    });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({
        token,
        membreId: Number(localStorage.getItem('membreId')),
        email: localStorage.getItem('email'),
        role: localStorage.getItem('role') as RoleSysteme,
        statut: (localStorage.getItem('statut') as StatutMembre) || null,
        nom: localStorage.getItem('nom'),
        prenom: localStorage.getItem('prenom'),
        photo: localStorage.getItem('photo'),
        isAuthenticated: true,
      });
    }
  },
}));
