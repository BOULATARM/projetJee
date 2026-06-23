'use client';
import { useLangStore } from '@/store/langStore';
import { useT } from '@/hooks/useT';

export function LangToggle() {
  const { lang, toggle } = useLangStore();
  const t = useT();

  return (
    <button
      onClick={toggle}
      className="rounded-lg px-2 py-1 text-xs font-semibold text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition-colors"
      aria-label={t.header.switchLang}
      title={t.header.switchLang}
    >
      {lang === 'fr' ? 'EN' : 'FR'}
    </button>
  );
}
