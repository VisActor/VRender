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

/**
 * 将路径转换为贝塞尔曲线数组
 * 通过复用CustomPath2D中的方法，确保处理的一致性
 * @param path 要转换的路径
 * @returns 贝塞尔曲线数组
 */
export function pathToBezierCurves(path: ICustomPath2D): number[][] {
  // 创建临时路径和临时上下文
  const tempPath = new CustomPath2D();

  // 将路径转换为SVG路径字符串，这样可以利用CustomPath2D中的解析能力
  const svgPathString = path.toString();

  // 如果路径为空，直接返回空数组
  if (!svgPathString) {
    return [];
  }

  // 使用临时路径解析SVG字符串
  tempPath.fromString(svgPathString);

  // 确保曲线已经构建
  const curves = tempPath.tryBuildCurves();

  if (!curves || curves.length === 0) {
    return [];
  }

  // 用于存储分离的子路径
  const bezierSubpaths: number[][] = [];
  let currentSubpath: number[] = null;

  // 初始化当前子路径
  currentSubpath = [];
  let firstX = 0; // 记录子路径起点X (用于闭合路径)
  let firstY = 0; // 记录子路径起点Y (用于闭合路径)
  let lastX = 0; // 记录上一个点的X (用于连续线段)
  let lastY = 0; // 记录上一个点的Y (用于连续线段)
  let isSubpathStart = true;
  let isPathClosed = false;

  for (let i = 0; i < curves.length; i++) {
    const curve = curves[i];

    // 如果是新的子路径开始或者第一个点
    if (isSubpathStart) {
      firstX = curve.p0.x;
      firstY = curve.p0.y;
      lastX = firstX;
      lastY = firstY;
      currentSubpath = [firstX, firstY];
      bezierSubpaths.push(currentSubpath);
      isSubpathStart = false;
    }

    // 处理不同类型的曲线
    if (curve.p1 && curve.p2 && curve.p3) {
      // 三次贝塞尔曲线
      currentSubpath.push(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y, curve.p3.x, curve.p3.y);
      lastX = curve.p3.x;
      lastY = curve.p3.y;
    } else if (curve.p1 && curve.p2) {
      // 二次贝塞尔曲线，转换为三次贝塞尔曲线
      const x1 = curve.p1.x;
      const y1 = curve.p1.y;
      const x2 = curve.p2.x;
      const y2 = curve.p2.y;

      currentSubpath.push(
        lastX + (2 / 3) * (x1 - lastX),
        lastY + (2 / 3) * (y1 - lastY),
        x2 + (2 / 3) * (x1 - x2),
        y2 + (2 / 3) * (y1 - y2),
        x2,
        y2
      );

      lastX = x2;
      lastY = y2;
    } else if (curve.p1) {
      // 直线段，转换为贝塞尔曲线格式
      // 直线的情况，p1就是终点
      const endX = curve.p1.x;
      const endY = curve.p1.y;

      // 避免添加长度为0的线段
      if (!(Math.abs(lastX - endX) < 1e-10 && Math.abs(lastY - endY) < 1e-10)) {
        // 使用addLineToBezierPath的逻辑：x0,y0, x1,y1, x1,y1
        // 第一个控制点等于起点，第二个控制点等于终点，终点等于终点
        currentSubpath.push(
          lastX,
          lastY, // 第一个控制点 = 起点
          endX,
          endY, // 第二个控制点 = 终点
          endX,
          endY // 终点
        );
      }

      lastX = endX;
      lastY = endY;
    }

    // 检查是否是闭合路径（最后一个点回到起点）
    if (i === curves.length - 1) {
      if (Math.abs(lastX - firstX) < 1e-10 && Math.abs(lastY - firstY) < 1e-10) {
        isPathClosed = true;
      }
    }

    // 检查是否需要开始新的子路径
    // 只有在检测到明确的路径中断（不连续的点）时才开始新子路径
    if (i < curves.length - 1) {
      const nextCurve = curves[i + 1];
      if (Math.abs(lastX - nextCurve.p0.x) > 1e-10 || Math.abs(lastY - nextCurve.p0.y) > 1e-10) {
        // 当前子路径结束，需要创建新的子路径
        isSubpathStart = true;
      }
    }
  }

  // 移除空的子路径
  const validSubpaths = bezierSubpaths.filter(subpath => subpath.length > 2);

  // 为了保持与原始函数一致，如果只有一个子路径，返回它的数组
  return validSubpaths.length === 1 ? [validSubpaths[0]] : validSubpaths;
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
