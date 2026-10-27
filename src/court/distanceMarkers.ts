import { NET_Y } from '../domain/court';

/** Distance from the net in meters, marked on both halves. The net is 0 m. */
const DISTANCES = [0, 3, 6, 9] as const;

/** Every marker as its stored y and its label; the net appears once. */
export const DISTANCE_MARKERS: readonly { y: number; label: string }[] = DISTANCES.flatMap((d) =>
  d === 0
    ? [{ y: NET_Y, label: '0 m' }]
    : [
        { y: NET_Y - d, label: `${d} m` },
        { y: NET_Y + d, label: `${d} m` },
      ],
);
