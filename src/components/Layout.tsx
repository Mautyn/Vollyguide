import { NavLink, Outlet } from 'react-router';
import { strings } from '../strings';

export function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <span className="brand">{strings.appName}</span>
        <nav>
          <NavLink to="/" end>
            {strings.nav.home}
          </NavLink>
          <NavLink to="/court">{strings.nav.court}</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
