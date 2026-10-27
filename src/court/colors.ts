import type { Role } from '../domain/types';

/** Role colours shared by the court and the player list (Tailwind 600 shades). */
export const roleColors: Readonly<Record<Role, string>> = {
  S: '#7c3aed',
  OH: '#2563eb',
  OPP: '#059669',
  MB: '#e11d48',
  L: '#d97706',
};

export const courtColors = {
  freeZone: '#1f5f8b',
  court: '#ee8a4f',
  line: '#ffffff',
  net: '#0f172a',
  netTape: '#f8fafc',
  zoneLabel: 'rgba(255, 255, 255, 0.45)',
  highlight: '#facc15',
  roles: roleColors,
  playerText: '#ffffff',
  playerShadow: '#0f172a',
} as const;
