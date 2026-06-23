import { useLangStore } from '@/store/langStore';
import { fr } from '@/locales/fr';
import { en } from '@/locales/en';

export function useT() {
  const { lang } = useLangStore();
  return lang === 'en' ? en : fr;
}
