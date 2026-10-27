import { OverlapStatus } from '../components/OverlapStatus';
import { PlayerList } from '../components/PlayerList';
import { CourtStage } from '../court/CourtStage';
import { lineupFromState, useCourtStore } from '../state/courtStore';
import { strings } from '../strings';

export function CourtPage() {
  const players = useCourtStore((s) => s.players);
  const serveZones = useCourtStore((s) => s.serveZones);
  const reset = useCourtStore((s) => s.reset);
  const lineup = lineupFromState(players, serveZones);

  return (
    <div className="court-page">
      <CourtStage />
      <aside className="court-panel">
        <h1>{strings.court.title}</h1>
        <p>{strings.court.hint}</p>
        {lineup && <OverlapStatus lineup={lineup} />}
        <button type="button" onClick={reset}>
          {strings.court.reset}
        </button>
        <PlayerList players={players} />
      </aside>
    </div>
  );
}
