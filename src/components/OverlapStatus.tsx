import { findOverlapViolations, type OverlapViolation } from '../domain/overlap';
import type { Point, ZoneMap } from '../domain/types';
import { strings } from '../strings';

function describe(violation: OverlapViolation): string {
  return violation.kind === 'front-back'
    ? strings.court.frontBack(violation.front, violation.back)
    : strings.court.leftRight(violation.left, violation.right);
}

export function OverlapStatus({ lineup }: { lineup: ZoneMap<Point> }) {
  const violations = findOverlapViolations(lineup);

  if (violations.length === 0) {
    return (
      <p role="status" className="overlap overlap--ok">
        {strings.court.lineupLegal}
      </p>
    );
  }

  return (
    <div role="status" className="overlap overlap--fault">
      <p>{strings.court.lineupIllegal}</p>
      <ul>
        {violations.map((v) => (
          <li key={describe(v)}>{describe(v)}</li>
        ))}
      </ul>
    </div>
  );
}
