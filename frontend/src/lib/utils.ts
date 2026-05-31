import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    PERMANENT: 'bg-blue-100 text-blue-800',
    ASSOCIE: 'bg-purple-100 text-purple-800',
    DOCTORANT: 'bg-green-100 text-green-800',
    RETRAITE: 'bg-gray-100 text-gray-800',
    ANCIEN: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTEE: 'bg-green-100 text-green-800',
    REFUSEE: 'bg-red-100 text-red-800',
    ACTIVE: 'bg-green-100 text-green-800',
    EXPIREE: 'bg-red-100 text-red-800',
    EN_COURS_NEGOCIATION: 'bg-blue-100 text-blue-800',
    PLANIFIE: 'bg-blue-100 text-blue-800',
    EN_COURS: 'bg-yellow-100 text-yellow-800',
    TERMINE: 'bg-green-100 text-green-800',
    ANNULE: 'bg-red-100 text-red-800',
    BROUILLON: 'bg-yellow-100 text-yellow-800',
    FINALISE: 'bg-green-100 text-green-800',
  };
  return colors[statut] || 'bg-gray-100 text-gray-800';
}
