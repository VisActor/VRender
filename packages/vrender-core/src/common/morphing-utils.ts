/* Adapted from zrender by ecomfe
 * https://github.com/ecomfe/zrender
 * Licensed under the BSD-3-Clause

 * url: https://github.com/ecomfe/zrender/blob/master/src/tool/morphPath.ts
 * License: https://github.com/ecomfe/zrender/blob/master/LICENSE
 * @license
 */

import type { IMatrix } from '@visactor/vutils';
import { getAngleByPoint, isNumberClose, PointService } from '@visactor/vutils';
import type { ICustomPath2D } from '../interface';
import { CustomPath2D } from './custom-path2d';
import { enumCommandMap } from './path-svg';
import { addArcToBezierPath } from './shape/arc';

export function cubicSubdivide(p0: number, p1: number, p2: number, p3: number, t: number, out: number[]) {
  const p01 = (p1 - p0) * t + p0;
  const p12 = (p2 - p1) * t + p1;
  const p23 = (p3 - p2) * t + p2;

  const p012 = (p12 - p01) * t + p01;
  const p123 = (p23 - p12) * t + p12;

  const p0123 = (p123 - p012) * t + p012;
  // Seg0
  out[0] = p0;
  out[1] = p01;
  out[2] = p012;
  out[3] = p0123;
  // Seg1
  out[4] = p0123;
  out[5] = p123;
  out[6] = p23;
  out[7] = p3;
}

export function alignSubpath(subpath1: number[], subpath2: number[]): [number[], number[]] {
  const len1 = subpath1.length;
  const len2 = subpath2.length;
  if (len1 === len2) {
    return [subpath1, subpath2];
  }
  const tmpSegX: number[] = [];
  const tmpSegY: number[] = [];

  const shorterPath = len1 < len2 ? subpath1 : subpath2;
  const shorterLen = Math.min(len1, len2);
  // Should divide excatly
  const diff = Math.abs(len2 - len1) / 6;
  const shorterBezierCount = (shorterLen - 2) / 6;
  // Add `diff` number of beziers
  const eachCurveSubDivCount = Math.ceil(diff / shorterBezierCount);

  const newSubpath = [shorterPath[0], shorterPath[1]];
  let remained = diff;

  for (let i = 2; i < shorterLen; i += 6) {
    let x0 = shorterPath[i - 2];
    let y0 = shorterPath[i - 1];
    let x1 = shorterPath[i];
    let y1 = shorterPath[i + 1];
    let x2 = shorterPath[i + 2];
    let y2 = shorterPath[i + 3];
    const x3 = shorterPath[i + 4];
    const y3 = shorterPath[i + 5];

    if (remained <= 0) {
      newSubpath.push(x1, y1, x2, y2, x3, y3);
      continue;
    }

    const actualSubDivCount = Math.min(remained, eachCurveSubDivCount) + 1;
    for (let k = 1; k <= actualSubDivCount; k++) {
      const p = k / actualSubDivCount;

      cubicSubdivide(x0, x1, x2, x3, p, tmpSegX);
      cubicSubdivide(y0, y1, y2, y3, p, tmpSegY);

      // tmpSegX[3] === tmpSegX[4]
      x0 = tmpSegX[3];
      y0 = tmpSegY[3];

      newSubpath.push(tmpSegX[1], tmpSegY[1], tmpSegX[2], tmpSegY[2], x0, y0);
      x1 = tmpSegX[5];
      y1 = tmpSegY[5];
      x2 = tmpSegX[6];
      y2 = tmpSegY[6];
      // The last point (x3, y3) is still the same.
    }
    remained -= actualSubDivCount - 1;
  }

  return shorterPath === subpath1 ? [newSubpath, subpath2] : [subpath1, newSubpath];
}

function createSubpath(lastSubpath: number[], otherSubpath: number[]) {
  const prevSubPath = lastSubpath || otherSubpath;
  const len = prevSubPath.length;
  const lastX = prevSubPath[len - 2];
  const lastY = prevSubPath[len - 1];

  const newSubpath: number[] = [];
  for (let i = 0; i < otherSubpath.length; i += 2) {
    newSubpath[i] = lastX;
    newSubpath[i + 1] = lastY;
  }
  return newSubpath;
}

function reverseSubpath(array: number[]) {
  const newArr: number[] = [];
  const len = array.length;
  for (let i = 0; i < len; i += 2) {
    newArr[i] = array[len - i - 2];
    newArr[i + 1] = array[len - i - 1];
  }
  return newArr;
}
/**
 * 用于计算内部不相交的多边形中心点
 */
export function centroidOfSubpath(array: number[]) {
  // https://en.wikipedia.org/wiki/Centroid#Of_a_polygon
  let signedArea = 0;
  let cx = 0;
  let cy = 0;
  const len = array.length;
  // Polygon should been closed.
  for (let i = 0, j = len - 2; i < len; j = i, i += 2) {
    const x0 = array[j];
    const y0 = array[j + 1];
    const x1 = array[i];
    const y1 = array[i + 1];
    const a = x0 * y1 - x1 * y0;
    signedArea += a;
    cx += (x0 + x1) * a;
    cy += (y0 + y1) * a;
  }

  if (signedArea === 0) {
    return [array[0] || 0, array[1] || 0, 0];
  }

  return [cx / signedArea / 3, cy / signedArea / 3, signedArea];
}

/**
 * 针对闭合的曲线，查找最适合的旋转offset
 */
function findBestRotationOffset(fromSubBeziers: number[], toSubBeziers: number[], fromCp: number[], toCp: number[]) {
  const bezierCount = (fromSubBeziers.length - 2) / 6;
  let bestScore = Infinity;
  let bestOffset = 0;

  const len = fromSubBeziers.length;
  const len2 = len - 2;

  for (let offset = 0; offset < bezierCount; offset++) {
    const cursorOffset = offset * 6;
    let score = 0;

    for (let k = 0; k < len; k += 2) {
      const idx = k === 0 ? cursorOffset : ((cursorOffset + k - 2) % len2) + 2;

      const x0 = fromSubBeziers[idx] - fromCp[0];
      const y0 = fromSubBeziers[idx + 1] - fromCp[1];
      const x1 = toSubBeziers[k] - toCp[0];
      const y1 = toSubBeziers[k + 1] - toCp[1];

      const dx = x1 - x0;
      const dy = y1 - y0;
      score += dx * dx + dy * dy;
    }
    if (score < bestScore) {
      bestScore = score;
      bestOffset = offset;
    }
  }

  return bestOffset;
}

/**
 * If we interpolating between two bezier curve arrays.
 * It will have many broken effects during the transition.
 * So we try to apply an extra rotation which can make each bezier curve morph as small as possible.
 */
export function findBestMorphingRotation(
  fromArr: number[][],
  toArr: number[][],
  searchAngleIteration: number,
  searchAngleRange: number
) {
  const result = [];

  let fromNeedsReverse: boolean;

  for (let i = 0; i < fromArr.length; i++) {
    let fromSubpathBezier = fromArr[i];
    const toSubpathBezier = toArr[i];

    const fromCp = centroidOfSubpath(fromSubpathBezier);
    const toCp = centroidOfSubpath(toSubpathBezier);

    if (fromNeedsReverse == null) {
      // Reverse from array if two have different directions.
      // Determine the clockwise based on the first subpath.
      // Reverse all subpaths or not. Avoid winding rule changed.
      fromNeedsReverse = fromCp[2] < 0 !== toCp[2] < 0;
    }

    const newFromSubpathBezier: number[] = [];
    const newToSubpathBezier: number[] = [];
    let bestAngle = 0;
    let bestScore = Infinity;
    const tmpArr: number[] = [];

    const len = fromSubpathBezier.length;
    if (fromNeedsReverse) {
      // Make sure clockwise
      fromSubpathBezier = reverseSubpath(fromSubpathBezier);
    }
    const offset = findBestRotationOffset(fromSubpathBezier, toSubpathBezier, fromCp, toCp) * 6;

    const len2 = len - 2;

    for (let k = 0; k < len2; k += 2) {
      // Not include the start point.
      const idx = ((offset + k) % len2) + 2;
      newFromSubpathBezier[k + 2] = fromSubpathBezier[idx] - fromCp[0];
      newFromSubpathBezier[k + 3] = fromSubpathBezier[idx + 1] - fromCp[1];
    }
    newFromSubpathBezier[0] = fromSubpathBezier[offset] - fromCp[0];
    newFromSubpathBezier[1] = fromSubpathBezier[offset + 1] - fromCp[1];

    if (searchAngleIteration > 0) {
      const step = searchAngleRange / searchAngleIteration;
      for (let angle = -searchAngleRange / 2; angle <= searchAngleRange / 2; angle += step) {
        const sa = Math.sin(angle);
        const ca = Math.cos(angle);
        let score = 0;

        for (let k = 0; k < fromSubpathBezier.length; k += 2) {
          const x0 = newFromSubpathBezier[k];
          const y0 = newFromSubpathBezier[k + 1];
          const x1 = toSubpathBezier[k] - toCp[0];
          const y1 = toSubpathBezier[k + 1] - toCp[1];

          // Apply rotation on the target point.
          const newX1 = x1 * ca - y1 * sa;
          const newY1 = x1 * sa + y1 * ca;

          tmpArr[k] = newX1;
          tmpArr[k + 1] = newY1;

          const dx = newX1 - x0;
          const dy = newY1 - y0;

          // Use dot product to have min direction change.
          // const d = Math.sqrt(x0 * x0 + y0 * y0);
          // score += x0 * dx / d + y0 * dy / d;
          score += dx * dx + dy * dy;
        }

        if (score < bestScore) {
          bestScore = score;
          bestAngle = angle;
          // Copy.
          for (let m = 0; m < tmpArr.length; m++) {
            newToSubpathBezier[m] = tmpArr[m];
          }
        }
      }
    } else {
      for (let i = 0; i < len; i += 2) {
        newToSubpathBezier[i] = toSubpathBezier[i] - toCp[0];
        newToSubpathBezier[i + 1] = toSubpathBezier[i + 1] - toCp[1];
      }
    }

    result.push({
      from: newFromSubpathBezier,
      to: newToSubpathBezier,
      fromCp,
      toCp,
      rotation: -bestAngle
    });
  }
  return result;
}

/**
 * Make two bezier arrays aligns on structure. To have better animation.
 *
 * It will:
 * Make two bezier arrays have same number of subpaths.
 * Make each subpath has equal number of bezier curves.
 *
 * array is the convert result of pathToBezierCurves.
 */
export function alignBezierCurves(array1: number[][], array2: number[][]) {
  let lastSubpath1;
  let lastSubpath2;

  const newArray1 = [];
  const newArray2 = [];

  for (let i = 0; i < Math.max(array1.length, array2.length); i++) {
    const subpath1 = array1[i];
    const subpath2 = array2[i];

    let newSubpath1;
    let newSubpath2;

    if (!subpath1) {
      newSubpath1 = createSubpath(lastSubpath1, subpath2);
      newSubpath2 = subpath2;
    } else if (!subpath2) {
      newSubpath2 = createSubpath(lastSubpath2, subpath1);
      newSubpath1 = subpath1;
    } else {
      [newSubpath1, newSubpath2] = alignSubpath(subpath1, subpath2);
      lastSubpath1 = newSubpath1;
      lastSubpath2 = newSubpath2;
    }

    newArray1.push(newSubpath1);
    newArray2.push(newSubpath2);
  }

  return [newArray1, newArray2];
}

const addLineToBezierPath = (bezierPath: number[], x0: number, y0: number, x1: number, y1: number) => {
  if (!(isNumberClose(x0, x1) && isNumberClose(y0, y1))) {
    bezierPath.push(x0, y0, x1, y1, x1, y1);
  }
};

export function pathToBezierCurves(path: ICustomPath2D): number[][] {
  const commandList = path.commandList;

  const bezierArrayGroups: number[][] = [];
  let currentSubpath: number[];

  // end point
  let xi: number = 0;
  let yi: number = 0;
  // start point
  let x0: number = 0;
  let y0: number = 0;

  const createNewSubpath = (x: number, y: number) => {
    // More than one M command
    if (currentSubpath && currentSubpath.length > 2) {
      bezierArrayGroups.push(currentSubpath);
    }
    currentSubpath = [x, y];
  };

  // the first control point
  let x1: number;
  let y1: number;
  // the second control point
  let x2: number;
  let y2: number;

  for (let i = 0, len = commandList.length; i < len; i++) {
    const cmd = commandList[i];

    const isFirst = i === 0;

    if (isFirst) {
      // 如果第一个命令是 L, C, Q
      // 则 previous point 同绘制命令的第一个 point
      // 第一个命令为 Arc 的情况下会在后面特殊处理
      x0 = xi = cmd[1] as number;
      y0 = yi = cmd[2] as number;

      if ([enumCommandMap.L, enumCommandMap.C, enumCommandMap.Q].includes(cmd[0])) {
        // Start point
        currentSubpath = [x0, y0];
      }
    }

    switch (cmd[0]) {
      case enumCommandMap.M:
        // moveTo 命令重新创建一个新的 subpath, 并且更新新的起点
        // 在 closePath 的时候使用
        xi = x0 = cmd[1] as number;
        yi = y0 = cmd[2] as number;

        createNewSubpath(x0, y0);
        break;
      case enumCommandMap.L:
        x1 = cmd[1] as number;
        y1 = cmd[2] as number;
        addLineToBezierPath(currentSubpath, xi, yi, x1, y1);
        xi = x1;
        yi = y1;
        break;
      case enumCommandMap.C:
        currentSubpath.push(
          cmd[1] as number,
          cmd[2] as number,
          cmd[3] as number,
          cmd[4] as number,
          (xi = cmd[5] as number),
          (yi = cmd[6] as number)
        );
        break;
      case enumCommandMap.Q:
        x1 = cmd[1] as number;
        y1 = cmd[2] as number;
        x2 = cmd[3] as number;
        y2 = cmd[4] as number;
        currentSubpath.push(
          // Convert quadratic to cubic
          xi + (2 / 3) * (x1 - xi),
          yi + (2 / 3) * (y1 - yi),
          x2 + (2 / 3) * (x1 - x2),
          y2 + (2 / 3) * (y1 - y2),
          x2,
          y2
        );
        xi = x2;
        yi = y2;
        break;
      case enumCommandMap.A: {
        const cx = cmd[1] as number;
        const cy = cmd[2] as number;
        const rx = cmd[3] as number;
        const ry = rx;
        const startAngle = cmd[4] as number;
        const endAngle = cmd[5] as number;

        const counterClockwise = !!(cmd[6] as number);

        x1 = Math.cos(startAngle) * rx + cx;
        y1 = Math.sin(startAngle) * rx + cy;
        if (isFirst) {
          // 直接使用 arc 命令
          // 第一个命令起点还未定义
          x0 = x1;
          y0 = y1;
          createNewSubpath(x0, y0);
        } else {
          // Connect a line between current point to arc start point.
          addLineToBezierPath(currentSubpath, xi, yi, x1, y1);
        }

        xi = Math.cos(endAngle) * rx + cx;
        yi = Math.sin(endAngle) * rx + cy;

        const step = ((counterClockwise ? -1 : 1) * Math.PI) / 2;

        for (let angle = startAngle; counterClockwise ? angle > endAngle : angle < endAngle; angle += step) {
          const nextAngle = counterClockwise ? Math.max(angle + step, endAngle) : Math.min(angle + step, endAngle);
          addArcToBezierPath(currentSubpath, angle, nextAngle, cx, cy, rx, ry);
        }
        break;
      }
      case enumCommandMap.E: {
        const cx = cmd[1] as number;
        const cy = cmd[2] as number;
        const rx = cmd[3] as number;
        const ry = cmd[4] as number;
        const rotate = cmd[5] as number;
        const startAngle = cmd[6] as number;
        const endAngle = (cmd[7] as number) + startAngle;

        const anticlockwise = !!(cmd[8] as number);
        const hasRotate = !isNumberClose(rotate, 0);
        const rc = Math.cos(rotate);
        const rs = Math.sin(rotate);

        let xTemp = Math.cos(startAngle) * rx;
        let yTemp = Math.sin(startAngle) * ry;

        if (hasRotate) {
          x1 = xTemp * rc - yTemp * rs + cx;
          y1 = xTemp * rs + yTemp * rc + cy;
        } else {
          x1 = xTemp + cx;
          y1 = yTemp + cy;
        }
        if (isFirst) {
          // 直接使用 arc 命令
          // 第一个命令起点还未定义
          x0 = x1;
          y0 = y1;
          createNewSubpath(x0, y0);
        } else {
          // Connect a line between current point to arc start point.
          addLineToBezierPath(currentSubpath, xi, yi, x1, y1);
        }

        xTemp = Math.cos(endAngle) * rx;
        yTemp = Math.sin(endAngle) * ry;
        if (hasRotate) {
          xi = xTemp * rc - yTemp * rs + cx;
          yi = xTemp * rs + yTemp * rc + cy;
        } else {
          xi = xTemp + cx;
          yi = yTemp + cy;
        }

        const step = ((anticlockwise ? -1 : 1) * Math.PI) / 2;

        for (let angle = startAngle; anticlockwise ? angle > endAngle : angle < endAngle; angle += step) {
          const nextAngle = anticlockwise ? Math.max(angle + step, endAngle) : Math.min(angle + step, endAngle);
          addArcToBezierPath(currentSubpath, angle, nextAngle, cx, cy, rx, ry);

          if (hasRotate) {
            const curLen = currentSubpath.length;

            for (let j = curLen - 6; j <= curLen - 1; j += 2) {
              xTemp = currentSubpath[j];
              yTemp = currentSubpath[j + 1];

              currentSubpath[j] = (xTemp - cx) * rc - (yTemp - cy) * rs + cx;
              currentSubpath[j + 1] = (xTemp - cx) * rs + (yTemp - cy) * rc + cy;
            }
          }
        }

        break;
      }
      case enumCommandMap.R: {
        x0 = xi = cmd[1] as number;
        y0 = yi = cmd[2] as number;
        x1 = x0 + (cmd[3] as number);
        y1 = y0 + (cmd[4] as number);

        // rect is an individual path.
        createNewSubpath(x1, y0);
        addLineToBezierPath(currentSubpath, x1, y0, x1, y1);
        addLineToBezierPath(currentSubpath, x1, y1, x0, y1);
        addLineToBezierPath(currentSubpath, x0, y1, x0, y0);
        addLineToBezierPath(currentSubpath, x0, y0, x1, y0);
        break;
      }
      case enumCommandMap.AT: {
        const tx1 = cmd[1] as number;
        const ty1 = cmd[2] as number;
        const tx2 = cmd[3] as number;
        const ty2 = cmd[4] as number;
        const r = cmd[5] as number;

        const dis1 = PointService.distancePP({ x: xi, y: yi }, { x: tx1, y: ty1 });
        const dis2 = PointService.distancePP({ x: tx2, y: ty2 }, { x: tx1, y: ty1 });
        const theta = ((xi - tx1) * (tx2 - tx1) + (yi - ty1) * (ty2 - ty1)) / (dis1 * dis2);
        const dis = r / Math.sin(theta / 2);
        const midX = (xi + tx2 - 2 * tx1) / 2;
        const midY = (yi + ty2 - 2 * ty1) / 2;
        const midLen = PointService.distancePP({ x: midX, y: midY }, { x: 0, y: 0 });
        const cx = tx1 + (dis * midX) / midLen;
        const cy = tx2 + (dis * midY) / midLen;
        const disP = Math.sqrt(dis * dis - r * r);
        x0 = tx1 + (disP * (xi - tx1)) / dis1;
        y0 = ty1 + (disP * (yi - ty1)) / dis1;

        // Connect a line between current point to arc start point.
        addLineToBezierPath(currentSubpath, xi, yi, x0, y0);

        xi = tx1 + (disP * (tx2 - tx1)) / dis2;
        yi = ty1 + (disP * (ty2 - ty1)) / dis2;

        const startAngle = getAngleByPoint({ x: cx, y: cy }, { x: x0, y: y0 });

        const endAngle = getAngleByPoint({ x: cx, y: cy }, { x: xi, y: yi });

        addArcToBezierPath(currentSubpath, startAngle, endAngle, cx, cy, r, r);

        break;
      }
      case enumCommandMap.Z: {
        currentSubpath && addLineToBezierPath(currentSubpath, xi, yi, x0, y0);
        xi = x0;
        yi = y0;
        break;
      }
    }
  }

  if (currentSubpath && currentSubpath.length > 2) {
    bezierArrayGroups.push(currentSubpath);
  }

  return bezierArrayGroups;
}

export function applyTransformOnBezierCurves(bezierCurves: number[][], martrix: IMatrix) {
  for (let i = 0; i < bezierCurves.length; i++) {
    const subPath = bezierCurves[i];
    for (let k = 0; k < subPath.length; k += 2) {
      const x = subPath[k];
      const y = subPath[k + 1];
      const res = { x, y };

      martrix.transformPoint({ x, y }, res);

      subPath[k] = res.x;
      subPath[k + 1] = res.y;
    }
  }
}

export function bezierCurversToPath(bezierCurves: number[][]) {
  const path = new CustomPath2D();

  for (let i = 0; i < bezierCurves.length; i++) {
    const subPath = bezierCurves[i];

    if (subPath.length > 2) {
      path.moveTo(subPath[0], subPath[1]);
      for (let k = 2; k < subPath.length; k += 6) {
        path.bezierCurveTo(subPath[k], subPath[k + 1], subPath[k + 2], subPath[k + 3], subPath[k + 4], subPath[k + 5]);
      }
    }
  }

  return path;
}
