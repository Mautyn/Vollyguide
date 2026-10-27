import { nextRotation, previousRotation, ROTATION_ORDER } from '../content/rotations';
import { useCourtStore } from '../state/courtStore';
import { strings } from '../strings';

export function RotationPicker() {
  const rotation = useCourtStore((s) => s.rotation);
  const setRotation = useCourtStore((s) => s.setRotation);

  return (
    <fieldset className="rotation-picker">
      <legend>{strings.court.rotationGroup}</legend>
      <div className="rotation-picker__buttons">
        {ROTATION_ORDER.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={r === rotation}
            aria-label={strings.court.rotation(r)}
            onClick={() => setRotation(r)}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="rotation-picker__step">
        <button type="button" onClick={() => setRotation(previousRotation(rotation))}>
          {strings.court.previousRotation}
        </button>
        <button type="button" onClick={() => setRotation(nextRotation(rotation))}>
          {strings.court.nextRotation}
        </button>
      </div>
      <p className="rotation-picker__hint">{strings.court.rotationHint}</p>
    </fieldset>
  );
}
