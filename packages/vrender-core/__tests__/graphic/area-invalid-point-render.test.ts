import type { IArea, ICurveType } from '../../src/interface';
import type { IPointLike } from '@visactor/vutils';
import { Area } from '../../src/graphic/area';
import { calcLineCache } from '../../src/common/segment';
import { drawAreaSegments } from '../../src/common/render-area';
import { basisPoints, createAreaContext, renderArea } from './area-test-utils';

const curveTypes: ICurveType[] = [
  'linear',
  'basis',
  'monotoneX',
  'monotoneY',
  'step',
  'stepBefore',
  'stepAfter',
  'stepClosed',
  'linearClosed',
  'catmullRom',
  'catmullRomClosed'
];
const left = [
  { x: 0, y: 4, y1: 0 },
  { x: 4, y: 8, y1: 0 },
  { x: 8, y: 6, y1: 0 },
  { x: 12, y: 10, y1: 0 }
];
const right = left.map(p => ({ ...p, x: p.x + 20 }));

describe('area paths with undefined points', () => {
  test('basis interpolation restarts at a gap before calculating either boundary', () => {
    const { nativeContext, area } = renderArea({ points: basisPoints, curveType: 'basis', connectedType: 'none' });
    expect(nativeContext.isPointInPath(95, 20)).toBe(false);
    expect(nativeContext.isPointInPath(5, 2)).toBe(true);
    expect(nativeContext.isPointInPath(25, 2)).toBe(true);
    expect(nativeContext.isPointInPath(15, 2)).toBe(false);
    expect(area.AABBBounds.x2).toBe(30);
    expect(area.AABBBounds.y2).toBe(10);
  });

  test('a leading undefined singleton cannot seed the next styled segment', () => {
    const { nativeContext, area, fills } = renderArea({
      connectedType: 'connect',
      segments: [
        { fill: 'blue', points: [basisPoints[2]] },
        { fill: 'green', points: basisPoints.slice(0, 2) }
      ]
    });
    expect(nativeContext.isPointInPath(95, 20)).toBe(false);
    expect(nativeContext.isPointInPath(5, 2)).toBe(true);
    expect(fills.map(attrs => attrs.fill)).toEqual(['green']);
    expect(area.AABBBounds.x2).toBe(10);
    expect(area.AABBBounds.y2).toBe(10);
  });

  test.each(curveTypes)('%s uses the same geometry as independently selected valid points', curveType => {
    const points = [...left, basisPoints[2], ...right];
    const actual = renderArea({ points, curveType, connectedType: 'none' });
    const first = renderArea({ points: left, curveType });
    const second = renderArea({ points: right, curveType });
    for (let x = 0.5; x < 34; x += 1) {
      for (let y = 0.5; y < 12; y += 1) {
        expect(actual.nativeContext.isPointInPath(x, y)).toBe(
          first.nativeContext.isPointInPath(x, y) || second.nativeContext.isPointInPath(x, y)
        );
      }
    }
    expect(renderArea({ points, curveType, connectedType: 'connect' }).commands).toEqual(
      renderArea({ points: [...left, ...right], curveType, connectedType: 'connect' }).commands
    );
  });

  test.each(curveTypes)('%s ignores missing coordinates for clipping and both stroke boundaries', curveType => {
    for (const connectedType of ['none', 'connect'] as const) {
      for (const clipRange of [0, 0.5, 1]) {
        for (const vertical of [false, true]) {
          const valid = vertical ? [...left, ...right].map(p => ({ x: p.y, y: p.x, x1: 0 })) : [...left, ...right];
          const points: IPointLike[] = [
            basisPoints[2],
            ...valid.slice(0, 4),
            basisPoints[2],
            ...valid.slice(4),
            basisPoints[2]
          ];
          const attrs = { points, curveType, connectedType, clipRange, stroke: [true, false, false] };
          const actual = renderArea(attrs);
          const displaced = renderArea({
            ...attrs,
            points: points.map(p => (p.defined === false ? { x: NaN, y: NaN, x1: NaN, y1: NaN, defined: false } : p))
          });
          expect(actual.commands).toEqual(displaced.commands);
          // Zero-projection clipping behavior is outside this missing-data fix.
          if (clipRange === 1) {
            expect(actual.commands.every(([, ...args]) => args.every(Number.isFinite))).toBe(true);
          }
          expect(renderArea({ ...attrs, stroke: [false, false, true] }).commands).toEqual(
            renderArea({ ...attrs, points: displaced.area.attribute.points, stroke: [false, false, true] }).commands
          );
        }
      }
    }
  });

  test.each(curveTypes)('%s preserves the existing all-defined styled segment contract', curveType => {
    const actual = renderArea({ segments: [{ points: left }, { points: right }], curveType });
    const previous = calcLineCache(left, curveType);
    const top = calcLineCache(right, curveType, { startPoint: { x: previous.endX, y: previous.endY } });
    const bottomPoints = [left[left.length - 1], ...right].reverse().map(p => ({ x: p.x, y: p.y1 }));
    const bottomType = curveType === 'stepBefore' ? 'stepAfter' : curveType === 'stepAfter' ? 'stepBefore' : curveType;
    const bottom = calcLineCache(bottomPoints, bottomType);
    const expected = createAreaContext();
    expected.context.beginPath();
    drawAreaSegments(expected.context, { top, bottom }, 1);
    const lastBegin = actual.commands.map(command => command[0]).lastIndexOf('beginPath');
    expect(actual.commands.slice(lastBegin)).toEqual(expected.commands);
  });

  test.each(['none', 'connect'] as const)(
    'empty and missing segments keep styles aligned in %s mode',
    connectedType => {
      const { fills, nativeContext } = renderArea({
        connectedType,
        segments: [
          { fill: 'empty', points: [] },
          { fill: 'invalid', points: [basisPoints[2]] },
          { fill: 'seed', points: [left[0]] },
          { fill: 'green', points: left.slice(1) },
          { fill: 'empty', points: [] },
          { fill: 'invalid', points: [basisPoints[2], basisPoints[2]] },
          { fill: 'blue', points: right }
        ]
      });
      expect(fills.map(attrs => attrs.fill)).toEqual(['green', 'blue']);
      expect(nativeContext.isPointInPath(25, 2)).toBe(true);
      expect(nativeContext.isPointInPath(95, 20)).toBe(false);
    }
  );

  test('a trailing missing point clears continuity only in none mode', () => {
    const segments = [{ points: [...left, basisPoints[2]] }, { points: right }];
    expect(renderArea({ segments, connectedType: 'none' }).nativeContext.isPointInPath(16, 2)).toBe(false);
    expect(renderArea({ segments, connectedType: 'connect' }).nativeContext.isPointInPath(16, 2)).toBe(true);
  });

  test('all missing points and singleton runs clear previously rendered geometry', () => {
    const area = new Area({ fill: 'red', points: basisPoints, curveType: 'basis' });
    renderArea(area);
    for (const points of [[], [basisPoints[2]], [left[0], basisPoints[2], right[0]]]) {
      area.setAttribute('points', points);
      const result = renderArea(area);
      expect(result.fills).toHaveLength(0);
      expect(result.nativeContext.isPointInPath(5, 2)).toBe(false);
    }
  });

  test('connection mode changes rebuild the cache without replacing points', () => {
    const area = new Area({ fill: 'red', points: basisPoints, connectedType: 'none' });
    expect(renderArea(area).nativeContext.isPointInPath(15, 2)).toBe(false);
    area.setAttribute('connectedType', 'connect');
    expect(renderArea(area).nativeContext.isPointInPath(15, 2)).toBe(true);
    area.setAttribute('connectedType', 'none');
    expect(renderArea(area).nativeContext.isPointInPath(15, 2)).toBe(false);
  });

  test('geometry attributes rebuild caches while repeated draws and clip updates reuse them', () => {
    const area = new Area({ fill: 'red', points: basisPoints, curveType: 'basis' });
    renderArea(area);
    let cache = (area as IArea).cacheArea;
    renderArea(area);
    area.setAttribute('clipRange', 0.5);
    renderArea(area);
    expect((area as IArea).cacheArea).toBe(cache);
    for (const attrs of [
      { curveType: 'linear' as const },
      { curveTension: 0.7 },
      { points: [...basisPoints] },
      { segments: [{ points: basisPoints }] }
    ]) {
      area.setAttributes(attrs);
      renderArea(area);
      expect((area as IArea).cacheArea).not.toBe(cache);
      cache = (area as IArea).cacheArea;
    }
  });

  test('valid input arrays and points remain owned by the caller', () => {
    const points = [...left, basisPoints[2], ...right].map(p => Object.freeze({ ...p }));
    Object.freeze(points);
    expect(() => renderArea({ points, curveType: 'basis' })).not.toThrow();
  });
});
