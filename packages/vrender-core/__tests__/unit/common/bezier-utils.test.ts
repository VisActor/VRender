import { cubicCalc, cubicPointAt, quadCalc, quadPointAt, snapLength } from '../../../src/common/bezier-utils';

describe('common/bezier-utils', () => {
  test('snapLength returns half perimeter of polygon', () => {
    // square perimeter = 4
    expect(snapLength([0, 1, 1, 0], [0, 0, 1, 1])).toBeCloseTo(2);
  });

  test('cubicCalc matches boundary t', () => {
    expect(cubicCalc(1, 2, 3, 4, 0)).toBe(1);
    expect(cubicCalc(1, 2, 3, 4, 1)).toBe(4);
  });

  test('quadCalc matches boundary t', () => {
    expect(quadCalc(1, 2, 3, 0)).toBe(1);
    expect(quadCalc(1, 2, 3, 1)).toBe(3);
  });

  test('cubicPointAt returns a point', () => {
    const p = cubicPointAt({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, 0.5);
    expect(p.x).toBeCloseTo(0.5);
    expect(p.y).toBeCloseTo(0.75);
  });

  test('quadPointAt returns a point', () => {
    const p = quadPointAt({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }, 0.5);
    expect(p.x).toBeCloseTo(1);
    expect(p.y).toBeCloseTo(0.5);
  });
});
