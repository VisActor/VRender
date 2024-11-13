/*
  优化自simplify-js: https://github.com/mourner/simplify-js
 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

import type { IPointLike } from '@visactor/vutils';

// basic distance-based simplification
function simplifyRadialDist(points: IPointLike[], sqTolerance: number): IPointLike[] {
  let lastX = points[0].x;
  let lastY = points[0].y;
  let deltaX;
  let deltaY;
  const newPoints: IPointLike[] = [points[0]];
  for (let i = 1, len = points.length; i < len; i++) {
    deltaX = points[i].x - lastX;
    deltaY = points[i].y - lastY;
    if (deltaX * deltaX + deltaY * deltaY > sqTolerance) {
      lastX = points[i].x;
      lastY = points[i].y;
      newPoints.push(points[i]);
    }
  }
  if (points[points.length - 1].x !== lastX || points[points.length - 1].y !== lastY) {
    newPoints.push(points[points.length - 1]);
  }
  return newPoints;
}
function simplifyDPStep(
  points: IPointLike[],
  startIdx: number,
  endIdx: number,
  sqTolerance: number,
  simplified: IPointLike[]
) {
  let maxSqDist = sqTolerance;
  let nextIdx = startIdx;
  const startX = points[startIdx].x;
  const startY = points[startIdx].y;
  const endX = points[endIdx].x;
  const endY = points[endIdx].y;
  const vecX2 = endX - startX;
  const vecY2 = endY - startY;
  const sqLength = vecX2 * vecX2 + vecY2 * vecY2;
  let area;
  let sqArea;
  let sqDistance;
  // 计算距离startIdx到endIdx最长的distance
  let vecX1;
  let vecY1;
  for (let i = startIdx + 1, len = endIdx - 1; i < len; i++) {
    vecX1 = points[i].x - startX;
    vecY1 = points[i].y - startY;
    // axb = x1y2 - x2y1
    area = vecX1 * vecY2 - vecX2 * vecY1;
    sqArea = area * area;
    sqDistance = sqArea / sqLength;
    if (sqDistance > maxSqDist) {
      maxSqDist = sqDistance;
      nextIdx = i;
    }
  }

  if (maxSqDist > sqTolerance) {
    if (nextIdx - startIdx > 2) {
      simplifyDPStep(points, startIdx, nextIdx, sqTolerance, simplified);
    }
    simplified.push(points[nextIdx], points[nextIdx + 1]);
    if (endIdx - nextIdx > 2) {
      simplifyDPStep(points, nextIdx + 1, endIdx, sqTolerance, simplified);
    }
  }
}
// simplification using Ramer-Douglas-Peucker algorithm
// https://karthaus.nl/rdp/
function simplifyDouglasPeucker(points: IPointLike[], sqTolerance: number): IPointLike[] {
  const lastIdx = points.length - 1;
  const simplified = [points[0]];
  simplifyDPStep(points, 0, lastIdx, sqTolerance, simplified);
  simplified.push(points[lastIdx]);
  return simplified;
}
// both algorithms combined for awesome performance
export function flatten_simplify(points: IPointLike[], tolerance: number, highestQuality: boolean): IPointLike[] {
  if (points.length <= 10) {
    return points;
  }
  const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
  points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
  // 暂时屏蔽 Douglas-Peucker 算法, 因为在极端情况下不会有点被删除, 导致性能问题
  // points = simplifyDouglasPeucker(points, sqTolerance);
  return points;
}
