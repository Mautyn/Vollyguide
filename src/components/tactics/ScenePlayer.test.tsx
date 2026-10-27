import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findSituation, findTopic } from '../../content/tactics';
import { ScenePlayer } from './ScenePlayer';

// Konva needs a real canvas; the court itself is covered by E2E tests.
vi.mock('../../court/CourtStage', () => ({
  CourtStage: ({ blocking }: { blocking?: readonly string[] }) => (
    <div data-testid="court-stage" data-blocking={(blocking ?? []).join(',')} />
  ),
}));

const scene = findSituation(findTopic('blocking')!, 'double-block-vs-outside')!.scene;

describe('ScenePlayer', () => {
  beforeEach(() => {
    // Reduced motion: no auto-play, so every step below is deterministic.
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('starts on the first moment, paused, when the user prefers reduced motion', () => {
    render(<ScenePlayer scene={scene} />);
    expect(screen.getByTestId('moment-counter')).toHaveTextContent('Moment 1 of 4');
    expect(screen.getByTestId('scene-caption')).toHaveTextContent(scene.keyframes[0]!.caption);
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('steps forward and back between moments and shows the block', async () => {
    render(<ScenePlayer scene={scene} />);
    const next = screen.getByRole('button', { name: 'Next moment' });
    await userEvent.click(next);
    await userEvent.click(next);
    expect(screen.getByTestId('moment-counter')).toHaveTextContent('Moment 3 of 4');
    expect(screen.getByTestId('court-stage')).toHaveAttribute('data-blocking', 'opp,mb');

    await userEvent.click(screen.getByRole('button', { name: 'Previous moment' }));
    expect(screen.getByTestId('moment-counter')).toHaveTextContent('Moment 2 of 4');
    expect(screen.getByTestId('court-stage')).toHaveAttribute('data-blocking', '');

    await userEvent.click(screen.getByRole('button', { name: 'Restart' }));
    expect(screen.getByTestId('moment-counter')).toHaveTextContent('Moment 1 of 4');
  });

  it('does not step past the last moment', async () => {
    render(<ScenePlayer scene={scene} />);
    for (let i = 0; i < 6; i++) {
      await userEvent.click(screen.getByRole('button', { name: 'Next moment' }));
    }
    expect(screen.getByTestId('moment-counter')).toHaveTextContent('Moment 4 of 4');
  });

  it('switches speed', async () => {
    render(<ScenePlayer scene={scene} />);
    await userEvent.click(screen.getByRole('radio', { name: '0.5×' }));
    expect(screen.getByRole('radio', { name: '0.5×' })).toHaveAttribute('aria-checked', 'true');
  });
});
