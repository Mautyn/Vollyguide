import { CircleAlert, CircleCheck } from 'lucide-react';
import { findOverlapViolations, type OverlapViolation } from '../domain/overlap';
import type { Point, ZoneMap } from '../domain/types';
import { strings } from '../strings';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

function describe(violation: OverlapViolation): string {
  return violation.kind === 'front-back'
    ? strings.court.frontBack(violation.front, violation.back)
    : strings.court.leftRight(violation.left, violation.right);
}

export function OverlapStatus({ lineup }: { lineup: ZoneMap<Point> }) {
  const violations = findOverlapViolations(lineup);

  if (violations.length === 0) {
    return (
      <Alert variant="success" role="status">
        <CircleCheck aria-hidden />
        <AlertTitle>{strings.court.lineupLegal}</AlertTitle>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" role="status">
      <CircleAlert aria-hidden />
      <AlertTitle>{strings.court.lineupIllegal}</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4">
          {violations.map((v) => (
            <li key={describe(v)}>{describe(v)}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
