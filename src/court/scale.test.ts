import { describe, expect, it } from 'vitest';
import { createCourtScale, fitCourtScale } from './scale';

describe('createCourtScale', () => {
  const scale = createCourtScale(20, 2);

  it('sizes the stage to the court plus margin', () => {
    expect(scale.stageWidth).toBe((9 + 4) * 20);
    expect(scale.stageHeight).toBe((18 + 4) * 20);
  });

  it('puts our end line at the bottom and the opponent end line at the top', () => {
    expect(scale.toPixels({ x: 0, y: 0 })).toEqual({ x: 40, y: 400 });
    expect(scale.toPixels({ x: 9, y: 18 })).toEqual({ x: 220, y: 40 });
  });

  it('places the net in the vertical middle of the stage', () => {
    expect(scale.toPixels({ x: 4.5, y: 9 })).toEqual({
      x: scale.stageWidth / 2,
      y: scale.stageHeight / 2,
    });
  });

  it('converts pixels back to meters', () => {
    expect(scale.toMeters({ x: 40, y: 400 })).toEqual({ x: 0, y: 0 });
    expect(scale.toMeters({ x: 130, y: 280 })).toEqual({ x: 4.5, y: 6 });
  });

  it('round-trips meters through pixels', () => {
    for (const point of [
      { x: 1.5, y: 7.5 },
      { x: -1.2, y: 19.4 },
      { x: 8.25, y: 0.3 },
    ]) {
      const back = scale.toMeters(scale.toPixels(point));
      expect(back.x).toBeCloseTo(point.x, 10);
      expect(back.y).toBeCloseTo(point.y, 10);
    }
  });

  it('converts lengths', () => {
    expect(scale.lengthToPixels(0.5)).toBe(10);
  });

  it('rejects invalid scales', () => {
    expect(() => createCourtScale(0)).toThrow();
    expect(() => createCourtScale(10, -1)).toThrow();
  });
});

describe('fitCourtScale', () => {
  it('is limited by height for a tall box', () => {
    const scale = fitCourtScale(1000, 240, 3);
    expect(scale.pxPerMeter).toBe(10);
    expect(scale.stageHeight).toBe(240);
  });

  it('is limited by width for a narrow box', () => {
    const scale = fitCourtScale(150, 1000, 3);
    expect(scale.pxPerMeter).toBe(10);
    expect(scale.stageWidth).toBe(150);
  });
});
