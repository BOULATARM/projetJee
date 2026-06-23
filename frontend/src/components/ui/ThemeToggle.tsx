'use client';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useT } from '@/hooks/useT';

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  const t = useT();

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition-colors"
      aria-label={theme === 'dark' ? t.header.lightMode : t.header.darkMode}
      title={theme === 'dark' ? t.header.lightMode : t.header.darkMode}
    >
      {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
