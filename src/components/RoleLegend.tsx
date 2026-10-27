import { roleColors } from '../court/colors';
import type { Role } from '../domain/types';
import { strings } from '../strings';

const ROLES: readonly Role[] = ['S', 'OH', 'OPP', 'MB', 'L'];

/** Colour key for the roles currently on court. */
export function RoleLegend({ roles }: { roles: readonly Role[] }) {
  return (
    <ul
      className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground"
      aria-label={strings.court.legendHeading}
    >
      {ROLES.filter((role) => roles.includes(role)).map((role) => (
        <li key={role} className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: roleColors[role] }}
            aria-hidden
          />
          {strings.roles[role]}
        </li>
      ))}
    </ul>
  );
}
