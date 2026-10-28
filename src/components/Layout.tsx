import { Volleyball } from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useLocale } from '../state/localeStore';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from '../lib/utils';
import { strings } from '../strings';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-2 py-1.5 text-sm font-medium transition-colors sm:px-3',
    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
  );

export function Layout() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:gap-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Volleyball className="size-5 text-primary" aria-hidden />
            {/* Icon only on phones, so all nav links fit. */}
            <span className="sr-only sm:not-sr-only">{strings.appName}</span>
          </NavLink>
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {/* On phones the logo links home, so five links still fit. */}
            <NavLink
              to="/"
              end
              className={(state) => cn(navLinkClass(state), 'hidden sm:inline-flex')}
            >
              {strings.nav.home}
            </NavLink>
            <NavLink to="/court" className={navLinkClass}>
              {strings.nav.court}
            </NavLink>
            <NavLink to="/lessons" className={navLinkClass}>
              {strings.nav.lessons}
            </NavLink>
            <NavLink to="/practice" className={navLinkClass}>
              {strings.nav.practice}
            </NavLink>
            <NavLink to="/tactics" className={navLinkClass}>
              {strings.nav.tactics}
            </NavLink>
          </nav>
          <LanguageSwitcher />
        </div>
      </header>
      {/* Re-mount the page when the language changes, so all text is read again. */}
      <main key={locale} className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
