import { create } from 'zustand';

type Lang = 'fr' | 'en';

interface LangState {
  lang: Lang;
  toggle: () => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang:
    typeof window !== 'undefined'
      ? ((localStorage.getItem('lang') as Lang) ?? 'fr')
      : 'fr',
  toggle: () =>
    set((state) => {
      const next: Lang = state.lang === 'fr' ? 'en' : 'fr';
      if (typeof window !== 'undefined') localStorage.setItem('lang', next);
      return { lang: next };
    }),
}));
