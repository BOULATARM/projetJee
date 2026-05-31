import { create } from 'zustand';
import { AuthResponse, RoleSysteme } from '@/types';

interface AuthState {
  token: string | null;
  membreId: number | null;
  email: string | null;
  role: RoleSysteme | null;
  nom: string | null;
  prenom: string | null;
  isAuthenticated: boolean;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  membreId: null,
  email: null,
  role: null,
  nom: null,
  prenom: null,
  isAuthenticated: false,

  setAuth: (auth: AuthResponse) => {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('membreId', String(auth.membreId));
    localStorage.setItem('email', auth.email);
    localStorage.setItem('role', auth.role);
    localStorage.setItem('nom', auth.nom);
    localStorage.setItem('prenom', auth.prenom);
    set({
      token: auth.token,
      membreId: auth.membreId,
      email: auth.email,
      role: auth.role,
      nom: auth.nom,
      prenom: auth.prenom,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.clear();
    set({
      token: null,
      membreId: null,
      email: null,
      role: null,
      nom: null,
      prenom: null,
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
        nom: localStorage.getItem('nom'),
        prenom: localStorage.getItem('prenom'),
        isAuthenticated: true,
      });
    }
  },
}));
