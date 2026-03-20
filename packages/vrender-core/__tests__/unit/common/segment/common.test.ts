import { genCurveSegments, genSegContext } from '../../../../src/common/segment/common';
import { Direction } from '../../../../src/common/enums';
import { ReflectSegContext, SegContext } from '../../../../src/common/seg-context';

describe('segment/common', () => {
  test('genCurveSegments calls lineStart/point/lineEnd in order', () => {
    const calls: string[] = [];
    const path = {
      lineStart: jest.fn(() => calls.push('lineStart')),
      lineEnd: jest.fn(() => calls.push('lineEnd')),
      point: jest.fn(() => calls.push('point'))
    };

    genCurveSegments(path as any, [
      { x: 0, y: 0 },
      { x: 1, y: 1 }
    ]);

    expect(path.lineStart).toHaveBeenCalledTimes(1);
    expect(path.lineEnd).toHaveBeenCalledTimes(1);
    expect(path.point).toHaveBeenCalledTimes(2);
    expect(calls[0]).toBe('lineStart');
    expect(calls[calls.length - 1]).toBe('lineEnd');
  });

  test('genSegContext infers direction by delta (row)', () => {
    const ctx = genSegContext(
      'linear' as any,
      undefined as any,
      [
        { x: 0, y: 0 },
        { x: 10, y: 1 }
      ] as any
    );

    expect(ctx).toBeInstanceOf(SegContext);
    expect(ctx.direction).toBe(Direction.ROW);
  });

  test('genSegContext infers direction by delta (column)', () => {
    const ctx = genSegContext(
      'linear' as any,
      undefined as any,
      [
        { x: 0, y: 0 },
        { x: 1, y: 10 }
      ] as any
    );

    expect(ctx.direction).toBe(Direction.COLUMN);
  });

  test('genSegContext returns ReflectSegContext for monotoneY', () => {
    const ctx = genSegContext(
      'monotoneY' as any,
      undefined as any,
      [
        { x: 0, y: 0 },
        { x: 10, y: 1 }
      ] as any
    );

    expect(ctx).toBeInstanceOf(ReflectSegContext);
  });

  test('genSegContext respects explicit direction', () => {
    const ctx = genSegContext(
      'linear' as any,
      Direction.COLUMN as any,
      [
        { x: 0, y: 0 },
        { x: 10, y: 1 }
      ] as any
    );

    expect(ctx.direction).toBe(Direction.COLUMN);
  });
});
