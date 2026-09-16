import { abs, type IPointLike } from '@visactor/vutils';
import type { IAreaCacheItem, IAreaSegment, ICurveType, IDirection, ISegPath2D } from '../interface';
import { Direction } from './enums';
import { calcLineCache } from './segment';
import type { SegContext } from './seg-context';
import { LineCurve } from './segment/curve/line';

export interface AreaRenderCacheItem extends IAreaCacheItem {
  sourceSegmentIndex: number;
  direction: IDirection;
}

/** Select both boundaries together, before interpolation can read undefined coordinates. */
export function getAreaPointRuns(points: IPointLike[], connectedType: 'none' | 'connect', startPoint?: IPointLike) {
  const runs: IPointLike[][] = [];
  if (!points.some(p => p.defined === false)) {
    const run = startPoint ? [startPoint, ...points] : points;
    if (run.length) {
      runs.push(run);
    }
    return { runs, tail: run[run.length - 1] };
  }

  let run: IPointLike[] = startPoint ? [startPoint] : [];
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (point.defined !== false) {
      run.push(point);
    } else if (connectedType !== 'connect') {
      if (run.length) {
        runs.push(run);
      }
      run = [];
    }
  }
  if (run.length) {
    runs.push(run);
  }
  return { runs, tail: run[run.length - 1] };
}

/** Join completed caches without restarting interpolation across a missing-data gap. */
function joinAreaPaths(paths: ISegPath2D[]): ISegPath2D {
  if (paths.length === 1) {
    return paths[0];
  }
  const curves: ISegPath2D['curves'] = [];
  for (let i = 0; i < paths.length; i++) {
    const next = paths[i].curves;
    if (curves.length) {
      const previous = curves[curves.length - 1];
      const gap = new LineCurve(previous.p3 ?? previous.p1, next[0].p0);
      gap.defined = false;
      gap.originP1 = previous.originP2;
      gap.originP2 = next[0].originP1;
      curves.push(gap);
    }
    for (let j = 0; j < next.length; j++) {
      curves.push(next[j]);
    }
  }
  // These are completed, read-only drawing caches. Reuse the final context so its
  // endX/endY still describe the final curve, without copying curve objects.
  const path = paths[paths.length - 1] as SegContext;
  path.curves = curves;
  path.length = NaN;
  return path;
}

function compileAreaRuns(
  runs: IPointLike[][],
  curveType: ICurveType,
  curveTension: number,
  sourceSegmentIndex: number,
  topStart?: IPointLike,
  bottomStart?: IPointLike
): AreaRenderCacheItem | null {
  const tops: ISegPath2D[] = [];
  const bottoms: ISegPath2D[] = [];
  const bottomType = curveType === 'stepBefore' ? 'stepAfter' : curveType === 'stepAfter' ? 'stepBefore' : curveType;
  for (let i = 0; i < runs.length; i++) {
    const points = runs[i];
    const startPoint = i === 0 ? topStart : undefined;
    if (points.length < 2 - Number(!!startPoint)) {
      continue;
    }
    const bottomPoints: IPointLike[] = [];
    for (let j = points.length - 1; j >= 0; j--) {
      const p = points[j];
      bottomPoints.push({ x: p.x1 ?? p.x, y: p.y1 ?? p.y });
    }
    if (i === 0 && bottomStart) {
      bottomPoints.push({ x: bottomStart.x1 ?? bottomStart.x, y: bottomStart.y1 ?? bottomStart.y });
    }
    // Preserve the curve generators' existing startPoint/closure semantics. In
    // particular, don't prepend a styled segment's startPoint to its input array.
    const top = calcLineCache(points, curveType, { startPoint, curveTension });
    const bottom = calcLineCache(bottomPoints, bottomType, { curveTension });
    if (top?.curves.length && bottom?.curves.length) {
      tops.push(top);
      bottoms.push(bottom);
    }
  }
  if (!tops.length) {
    return null;
  }
  return {
    top: joinAreaPaths(tops),
    bottom: joinAreaPaths(bottoms.reverse()),
    sourceSegmentIndex,
    direction: Direction.ROW
  };
}

export function calcAreaCache(
  points: IPointLike[] | undefined,
  segments: IAreaSegment[] | undefined,
  curveType: ICurveType,
  connectedType: 'none' | 'connect',
  curveTension: number
): AreaRenderCacheItem | AreaRenderCacheItem[] | null {
  const caches: AreaRenderCacheItem[] = [];
  let tail: IPointLike;
  let topTail: IPointLike;
  let first: IPointLike;
  let last: IPointLike;
  const count = segments ? segments.length : 1;
  for (let i = 0; i < count; i++) {
    const segmentPoints = segments ? segments[i].points : points ?? [];
    const result = getAreaPointRuns(segmentPoints, connectedType);
    const canContinue = connectedType === 'connect' || segmentPoints[0]?.defined !== false;
    if (result.runs.length) {
      first = first ?? result.runs[0][0];
      const lastRun = result.runs[result.runs.length - 1];
      last = lastRun[lastRun.length - 1];
    }
    const cache = compileAreaRuns(
      result.runs,
      curveType,
      curveTension,
      i,
      canContinue ? topTail : undefined,
      canContinue ? tail : undefined
    );
    if (cache) {
      caches.push(cache);
    }
    if (result.tail) {
      tail = result.tail;
      const lastRun = result.runs[result.runs.length - 1];
      topTail =
        cache && (result.runs.length === 1 || lastRun.length > 1) ? { x: cache.top.endX, y: cache.top.endY } : tail;
    } else if (connectedType !== 'connect' && segmentPoints.length) {
      tail = topTail = undefined;
    }
  }
  if (!caches.length) {
    return null;
  }
  let direction = Direction.ROW;
  if (last.x1 != null) {
    const dx = abs(last.x - first.x);
    const dy = abs(last.y - first.y);
    if (last.y1 == null || (Number.isFinite(dx + dy) && dy >= dx)) {
      direction = Direction.COLUMN;
    }
  }
  for (let i = 0; i < caches.length; i++) {
    caches[i].direction = direction;
  }
  return segments ? caches : caches[0];
}
