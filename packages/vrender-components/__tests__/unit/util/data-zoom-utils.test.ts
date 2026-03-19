import { isTextOverflow } from '../../../src/data-zoom/utils';

describe('data-zoom/utils', () => {
  const component = { x1: 0, y1: 0, x2: 100, y2: 100 } as any;

  test('returns false when textBounds is null', () => {
    expect(isTextOverflow(component, null as any, 'start' as any, true)).toBe(false);
  });

  test('horizontal start/end overflow', () => {
    expect(isTextOverflow(component, { x1: -1, x2: 10, y1: 0, y2: 0 } as any, 'start' as any, true)).toBe(true);
    expect(isTextOverflow(component, { x1: 0, x2: 101, y1: 0, y2: 0 } as any, 'end' as any, true)).toBe(true);
    expect(isTextOverflow(component, { x1: 0, x2: 100, y1: 0, y2: 0 } as any, 'end' as any, true)).toBe(false);
  });

  test('vertical start/end overflow', () => {
    expect(isTextOverflow(component, { y1: -0.1, y2: 10, x1: 0, x2: 0 } as any, 'start' as any, false)).toBe(true);
    expect(isTextOverflow(component, { y1: 0, y2: 100.0001, x1: 0, x2: 0 } as any, 'end' as any, false)).toBe(true);
  });
});
