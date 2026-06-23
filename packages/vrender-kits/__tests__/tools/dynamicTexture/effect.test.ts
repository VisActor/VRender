import {
  randomOpacity,
  columnLeftToRight,
  columnRightToLeft,
  rowTopToBottom,
  rowBottomToTop,
  diagonalCenterToEdge,
  diagonalTopLeftToBottomRight,
  rotationScan,
  rippleEffect,
  snakeWave,
  alternatingWave,
  spiralEffect,
  columnCenterToEdge,
  columnEdgeToCenter,
  rowCenterToEdge,
  rowEdgeToCenter,
  cornerToCenter,
  centerToCorner,
  pulseWave,
  particleEffect
} from '../../../src/tools/dynamicTexture/effect';

describe('vrender-kits dynamicTexture effects', () => {
  const ctx: any = {};
  const graphic: any = {};

  const fns: Array<[string, Function]> = [
    ['randomOpacity', randomOpacity],
    ['columnLeftToRight', columnLeftToRight],
    ['columnRightToLeft', columnRightToLeft],
    ['rowTopToBottom', rowTopToBottom],
    ['rowBottomToTop', rowBottomToTop],
    ['diagonalCenterToEdge', diagonalCenterToEdge],
    ['diagonalTopLeftToBottomRight', diagonalTopLeftToBottomRight],
    ['rotationScan', rotationScan],
    ['rippleEffect', rippleEffect],
    ['snakeWave', snakeWave],
    ['alternatingWave', alternatingWave],
    ['spiralEffect', spiralEffect],
    ['columnCenterToEdge', columnCenterToEdge],
    ['columnEdgeToCenter', columnEdgeToCenter],
    ['rowCenterToEdge', rowCenterToEdge],
    ['rowEdgeToCenter', rowEdgeToCenter],
    ['cornerToCenter', cornerToCenter],
    ['centerToCorner', centerToCorner],
    ['pulseWave', pulseWave],
    ['particleEffect', particleEffect]
  ];

  test('all effects clamp output into [0, 1]', () => {
    for (const [name, fn] of fns) {
      const v1 = fn(ctx, 1, 2, 10, 10, 0, graphic, 0, 1);
      const v2 = fn(ctx, 1, 2, 10, 10, 0.5, graphic, 0.2, 2);
      const v3 = fn(ctx, 1, 2, 10, 10, 1, graphic, 0, 1);

      for (const v of [v1, v2, v3]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }

      // basic determinism for pure functions
      const repeat = fn(ctx, 1, 2, 10, 10, 0.5, graphic, 0.2, 2);
      expect(repeat).toBe(v2);
    }
  });

  test('randomOpacity differs across cells', () => {
    const a = randomOpacity(ctx, 0, 0, 10, 10, 0.25, graphic);
    const b = randomOpacity(ctx, 0, 1, 10, 10, 0.25, graphic);
    expect(a).not.toBe(b);
  });
});
