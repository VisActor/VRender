import { normalizeRectAttributes } from '../../../src/common/rect-utils';

describe('common/rect-utils', () => {
  test('returns zeros for empty attribute', () => {
    expect(normalizeRectAttributes(null as any)).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    expect(normalizeRectAttributes(undefined as any)).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  test('uses x1/y1 when width/height is nil', () => {
    const attr = { x: 10, y: 20, x1: 15, y1: 40 };
    expect(normalizeRectAttributes(attr as any)).toEqual({ x: 0, y: 0, width: 5, height: 20 });
  });

  test('normalizes negative width/height', () => {
    const attr = { x: 0, y: 0, width: -10, height: -20 };
    expect(normalizeRectAttributes(attr as any)).toEqual({ x: -10, y: -20, width: 10, height: 20 });
  });

  test('normalizes NaN width/height', () => {
    const attr = { x: 0, y: 0, width: Number.NaN, height: Number.NaN };
    expect(normalizeRectAttributes(attr as any)).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});
