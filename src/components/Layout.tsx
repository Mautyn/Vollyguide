import { Volleyball } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { cn } from '../lib/utils';
import { strings } from '../strings';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
  );

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:gap-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Volleyball className="size-5 text-primary" aria-hidden />
            {strings.appName}
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              {strings.nav.home}
            </NavLink>
            <NavLink to="/court" className={navLinkClass}>
              {strings.nav.court}
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
