/* Adapted from zrender by ecomfe
 * https://github.com/ecomfe/zrender
 * Licensed under the BSD-3-Clause

 * url: https://github.com/ecomfe/zrender/blob/master/src/tool/dividePath.ts
 * License: https://github.com/ecomfe/zrender/blob/master/LICENSE
 * @license
 */

import type { ICustomPath2D } from './../interface/path';
import type { IPointLike } from '@visactor/vutils';
import { isNumber, Bounds, getIntersectPoint } from '@visactor/vutils';
import type { ILine, IRect, IArc, ICircle, IArea, IPolygon, IPath } from '../interface';
import { bezierCurversToPath, pathToBezierCurves } from './morphing-utils';
import { normalizeRectAttributes } from './rect-utils';
/**
 * split a rect to grids
 */
export function splitToGrids(width: number, height: number, count: number) {
  const ratio = width / height;

  let rowCount: number;
  let columnCount: number;

  if (width >= height) {
    columnCount = Math.ceil(Math.sqrt(count * ratio));
    rowCount = Math.floor(count / columnCount);

    if (rowCount === 0) {
      rowCount = 1;
      columnCount = count;
    }
  } else {
    rowCount = Math.ceil(Math.sqrt(count / ratio));
    columnCount = Math.floor(count / rowCount);

    if (columnCount === 0) {
      columnCount = 1;
      rowCount = count;
    }
  }

  const grids: number[] = [];
  for (let i = 0; i < rowCount; i++) {
    grids.push(columnCount);
  }
  const sumCount = rowCount * columnCount;
  const remained = count - sumCount;

  if (remained > 0) {
    for (let i = 0; i < remained; i += columnCount) {
      if (i + columnCount < remained) {
        grids.push(columnCount);
      } else {
        grids.push(remained - i);
      }
    }
  }
  return grids;
}

export const splitRect = (rect: IRect, count: number) => {
  const { width, height } = normalizeRectAttributes(rect.attribute);

  const x = 0;
  const y = 0;
  const grids = splitToGrids(width, height, count);
  const res = [];
  const gridHeight = height / grids.length;

  for (let i = 0, rowCount = grids.length; i < rowCount; i++) {
    const columnCount = grids[i];
    const gridWidth = width / columnCount;
    for (let j = 0; j < columnCount; j++) {
      res.push({
        x: x + j * gridWidth,
        y: y + i * gridHeight,
        width: gridWidth,
        height: gridHeight
      });
    }
  }

  return res;
};

export const splitArc = (arc: IArc, count: number) => {
  const x = 0;
  const y = 0;
  const angles = arc.getParsedAngle();
  const startAngle = angles.startAngle;
  const endAngle = angles.endAngle;
  const innerRadius = arc.getComputedAttribute('innerRadius');
  const outerRadius = arc.getComputedAttribute('outerRadius');
  const angleDelta = Math.abs(startAngle - endAngle);
  const radiusDelta = Math.abs(outerRadius - innerRadius);

  const grids = splitToGrids((angleDelta * (innerRadius + outerRadius)) / 2, radiusDelta, count);
  const res = [];
  const gridRadius = radiusDelta / grids.length;
  const radiusSign = outerRadius >= innerRadius ? 1 : -1;
  const angleSign = endAngle >= startAngle ? 1 : -1;

  for (let i = 0, rowCount = grids.length; i < rowCount; i++) {
    const columnCount = grids[i];
    const gridAngle = angleDelta / columnCount;
    for (let j = 0; j < columnCount; j++) {
      // from outter to inner
      res.push({
        innerRadius: outerRadius - gridRadius * i * radiusSign,
        outerRadius: outerRadius - gridRadius * (i + 1) * radiusSign,
        startAngle: startAngle + gridAngle * j * angleSign,
        endAngle: startAngle + gridAngle * (j + 1) * angleSign
      });
    }
  }

  return res;
};

export const splitCircle = (arc: ICircle, count: number) => {
  const x = 0;
  const y = 0;
  const startAngle = arc.getComputedAttribute('startAngle');
  const endAngle = arc.getComputedAttribute('endAngle');
  const radius = arc.getComputedAttribute('radius');
  const angleDelta = Math.abs(startAngle - endAngle);

  const grids = splitToGrids(angleDelta * radius, radius, count);
  const res = [];
  const gridAngle = angleDelta / grids[0];
  const gridRadius = radius / grids.length;
  const angleSign = endAngle >= startAngle ? 1 : -1;

  for (let i = 0, rowCount = grids.length; i < rowCount; i++) {
    for (let j = 0, columnCount = grids[i]; j < columnCount; j++) {
      res.push({
        innerRadius: gridRadius * i,
        outerRadius: gridRadius * (i + 1),
        startAngle: startAngle + gridAngle * j * angleSign,
        endAngle: startAngle + gridAngle * (j + 1) * angleSign
      });
    }
  }

  return res;
};

const samplingPoints = (points: IPointLike[], count: number) => {
  const validatePoints = points.filter(point => point.defined !== false && isNumber(point.x) && isNumber(point.y));

  if (validatePoints.length === 0) {
    return [];
  }
  if (validatePoints.length === 1) {
    return new Array(count).fill(0).map(i => validatePoints[0]);
  }

  const res = [];
  if (count <= validatePoints.length) {
    const step = validatePoints.length / count;
    let i = 0;
    let cur = 0;

    while (i < count) {
      res.push(validatePoints[Math.floor(cur)]);

      cur += step;
      i++;
    }

    return res;
  }

  const insertCount = count - validatePoints.length;
  const insertStep = insertCount / (validatePoints.length - 1);
  const insetRatio = 1 / (insertStep + 1);
  let curCount = 0;

  for (let i = 0, len = points.length; i < len; i++) {
    res.push(points[i]);

    if (i < len - 1) {
      let cur = insetRatio;
      const xCur = points[i].x;
      const yCur = points[i].y;
      const xNext = points[i + 1].x;
      const yNext = points[i + 1].y;

      while (cur < 1 && curCount < insertCount) {
        res.push({
          x: xCur + (xNext - xCur) * cur,
          y: yCur + (yNext - yCur) * cur
        });
        cur += insetRatio;
        curCount += 1;
      }
    }
  }

  return res;
};

export const splitArea = (area: IArea, count: number) => {
  const attribute = area.attribute;
  let points = attribute.points;
  const segements = attribute.segments;

  if (!points) {
    points = segements.reduce((res, seg) => {
      return res.concat(seg.points ?? []);
    }, []);
  }
  const validatePoints = points.filter(point => point.defined !== false && isNumber(point.x) && isNumber(point.y));

  if (!validatePoints.length) {
    return [];
  }

  const allPoints: IPointLike[] = [];

  validatePoints.forEach(point => {
    allPoints.push({ x: point.x, y: point.y });
  });

  for (let i = validatePoints.length - 1; i >= 0; i--) {
    const point = validatePoints[i];

    allPoints.push({ x: point.x1 ?? point.x, y: point.y1 ?? point.y });
  }

  const res: { points: IPointLike[] }[] = [];

  recursiveCallBinarySplit(points, count, res);

  return res;
};

export const splitLine = (line: ILine, count: number) => {
  const attribute = line.attribute;
  const points = attribute.points;

  if (points) {
    return samplingPoints(points, count);
  } else if (attribute.segments) {
    const segs = attribute.segments;
    const allPoints = segs.reduce((res, seg) => {
      return res.concat(seg.points ?? []);
    }, []);

    return samplingPoints(allPoints, count);
  }
  return [];
};

function crossProduct(dir1: [number, number], dir2: [number, number]): number {
  return dir1[0] * dir2[1] - dir1[1] * dir2[0];
}

const clonePoints = (points: IPointLike[]) => {
  return points.map(p => ({ x: p.x, y: p.y }));
};

const splitPolygonByLine = (points: IPointLike[], p0: IPointLike, p1: IPointLike) => {
  const len = points.length;
  const intersections: { dot: number; point: IPointLike; edgeIndex: number }[] = [];

  for (let i = 0; i < len; i++) {
    const cur = points[i];
    const next = i === len - 1 ? points[0] : points[i + 1];

    const res = getIntersectPoint([p0.x, p0.y], [p1.x, p1.y], [cur.x, cur.y], [next.x, next.y]);

    if (res && typeof res !== 'boolean') {
      intersections.push({
        dot: crossProduct([res[0] - p0.x, res[1] - p0.x], [p1.x - p0.x, p1.y - p0.x]),
        point: { x: res[0], y: res[1] },
        edgeIndex: i
      });
    }
  }

  if (intersections.length < 2) {
    //  没有交点或者和某条边共线
    return [clonePoints(points), clonePoints(points)];
  }

  intersections.sort((a, b) => a.dot - b.dot);
  let is0 = intersections[0];
  let is1 = intersections[intersections.length - 1];

  if (is0.edgeIndex > is1.edgeIndex) {
    [is0, is1] = [is1, is0];
  }

  const newP0 = is0.point;
  const newP1 = is1.point;
  const newPointsA = [{ x: newP0.x, y: newP0.y }];

  for (let i = is0.edgeIndex + 1; i <= is1.edgeIndex; i++) {
    newPointsA.push({ x: points[i].x, y: points[i].y });
  }
  newPointsA.push({ x: newP1.x, y: newP1.y });

  const newPointsB = [{ x: newP1.x, y: newP1.y }];
  for (let i = is1.edgeIndex + 1, maxIndex = is0.edgeIndex + len; i <= maxIndex; i++) {
    const p = points[i % len];
    newPointsB.push({ x: p.x, y: p.y });
  }
  newPointsB.push({ x: newP0.x, y: newP0.y });

  return [newPointsA, newPointsB];
};

export const binarySplitPolygon = (points: IPointLike[]) => {
  const box = new Bounds();

  points.forEach(point => {
    box.add(point.x, point.y);
  });
  const width = box.width();
  const height = box.height();

  if (width >= height) {
    // split horizontal
    const midX = box.x1 + width / 2;

    return splitPolygonByLine(
      points,
      {
        x: midX,
        y: box.y1
      },
      {
        x: midX,
        y: box.y2
      }
    );
  }
  // split vertical
  const midY = box.y1 + height / 2;

  return splitPolygonByLine(
    points,
    {
      x: box.x1,
      y: midY
    },
    {
      x: box.x2,
      y: midY
    }
  );
};

export const recursiveCallBinarySplit = (points: IPointLike[], count: number, out: { points: IPointLike[] }[]) => {
  if (count === 1) {
    out.push({ points });
  } else {
    const half = Math.floor(count / 2);
    const res = binarySplitPolygon(points);

    recursiveCallBinarySplit(res[0], half, out);
    recursiveCallBinarySplit(res[1], count - half, out);
  }
};

export const splitPolygon = (polygon: IPolygon, count: number) => {
  const points = polygon.attribute.points;

  if (!points || !points.length) {
    return [];
  }
  if (count === 1) {
    return [{ points: clonePoints(points) }];
  }
  const res: { points: IPointLike[] }[] = [];

  recursiveCallBinarySplit(points, count, res);

  return res;
};

export const splitPath = (path: IPath, count: number) => {
  const pathShape = path.getParsedPathShape();
  const bezierCurves = pathToBezierCurves(pathShape);

  if (!bezierCurves.length || count < 0) {
    return [];
  }

  const subPathCnt = bezierCurves.length;

  if (bezierCurves.length >= count) {
    const res: { path: ICustomPath2D }[] = [];
    const stepCount = Math.floor(bezierCurves.length / count);

    for (let i = 0; i < count; i++) {
      const curves = bezierCurves.slice(i * stepCount, i === count - 1 ? subPathCnt : (i + 1) * stepCount);

      res.push({ path: bezierCurversToPath(curves) });
    }

    return res;
  }

  const res: { points: IPointLike[] }[] = [];
  const stepCount = Math.floor(count / subPathCnt);
  let remain = count;

  for (let c = 0; c < subPathCnt; c++) {
    const points: IPointLike[] = [];

    for (let i = 2, len = bezierCurves[c].length; i < len; i += 2) {
      points.push({ x: bezierCurves[0][i], y: bezierCurves[0][i + 1] });
    }
    recursiveCallBinarySplit(points, c === subPathCnt - 1 ? remain : stepCount, res);
    remain -= stepCount;
  }

  return res;
};
