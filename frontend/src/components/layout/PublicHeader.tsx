'use client';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LangToggle } from '@/components/ui/LangToggle';
import { useT } from '@/hooks/useT';

interface PublicHeaderProps {
  title?: string;
  subtitle?: string;
  /** Show full nav (home page). When false shows back link only. */
  fullNav?: boolean;
}

export function PublicHeader({ title = 'LIAS', subtitle, fullNav = false }: PublicHeaderProps) {
  const t = useT();

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center gap-4">
        <div>
          {fullNav ? (
            <>
              <h1 className="text-3xl font-heading font-bold">{title}</h1>
              {subtitle && <p className="text-blue-200 text-sm mt-0.5">{subtitle}</p>}
            </>
          ) : (
            <>
              <Link href="/" className="text-blue-200 hover:text-white text-sm">
                {t.pub.backHome}
              </Link>
              <h1 className="text-3xl font-heading font-bold mt-1">{title}</h1>
              {subtitle && <p className="text-blue-200 text-sm mt-0.5">{subtitle}</p>}
            </>
          )}
        </div>

        <nav className="flex items-center gap-2 flex-wrap justify-end">
          {fullNav && (
            <>
              <Link href="/membres" className="text-white hover:text-blue-200 text-sm">{t.pub.members}</Link>
              <Link href="/equipes"  className="text-white hover:text-blue-200 text-sm">{t.pub.teams}</Link>
              <Link href="/evenements" className="text-white hover:text-blue-200 text-sm">{t.pub.events}</Link>
              <Link href="/publications" className="text-white hover:text-blue-200 text-sm">{t.pub.publications}</Link>
              <Link href="/auth/login" className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-blue-50 text-sm">
                {t.pub.login}
              </Link>
              <Link href="/adhesion" className="bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 text-sm">
                {t.pub.join}
              </Link>
            </>
          )}
          {!fullNav && (
            <Link href="/auth/login" className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-blue-50 text-sm">
              {t.pub.login}
            </Link>
          )}

          {/* Theme & Language toggles visible to visitors */}
          <div className="flex items-center gap-1 ml-1">
            <div className="[&_button]:text-white [&_button]:hover:bg-white/20 [&_button]:dark:text-white [&_button]:dark:hover:bg-white/20">
              <ThemeToggle />
            </div>
            <div className="[&_button]:text-white [&_button]:hover:bg-white/20 [&_button]:dark:text-white [&_button]:dark:hover:bg-white/20">
              <LangToggle />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
