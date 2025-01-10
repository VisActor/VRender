import type { IPoint, IPointLike } from '@visactor/vutils';
import { min } from '@visactor/vutils';
import type {
  IAreaSegment,
  IClipRangeByDimensionType,
  ICurve,
  IDirection,
  IPath2D,
  ISegment,
  ISegPath2D
} from '../interface';
import { Direction } from './enums';
import { drawSegItem } from './render-utils';

function drawEachCurve(
  path: IPath2D,
  curve: ICurve<IPoint>,
  lastCurve: ICurve<IPoint>,
  defined0: boolean,
  offsetX: number,
  offsetY: number,
  offsetZ: number
) {
  let p0 = curve.p0;
  let newDefined0 = defined0;

  if (lastCurve && lastCurve.originP1 === lastCurve.originP2) {
    p0 = lastCurve.p0;
  }
  if (curve.defined) {
    // 非法变合法需要lineTo，合法变非法需要moveTo，初始非法需要moveTo
    if (!defined0) {
      path.lineTo(p0.x + offsetX, p0.y + offsetY, offsetZ);
      newDefined0 = !defined0;
    }
  } else {
    // 找到合法的点
    const { originP1, originP2 } = curve;
    let validP: IPointLike;
    // 只能第一个curve才可以用p0作为合法点，后面的curve都不应该算p1，因为已经算在前面了
    // lastCurve只在第一个curve不存在
    if (originP1 && originP1.defined !== false && !lastCurve) {
      validP = p0;
    } else if (originP1 && originP2.defined !== false) {
      validP = curve.p3 ?? curve.p1;
    }
    // 合法/（初始）变非法，moveTo
    if (defined0) {
      newDefined0 = !defined0;
      const x = validP ? validP.x : curve.p0.x;
      const y = validP ? validP.y : curve.p0.y;
      path.moveTo(x + offsetX, y + offsetY, offsetZ);
    } else {
      // 非法变非法/合法，看情况要不要lineTo
      if (validP) {
        // 非法变合法，需要lineTo
        newDefined0 = !defined0;
        path.lineTo(validP.x + offsetX, validP.y + offsetY, offsetZ);
      }
    }
  }

  return newDefined0;
}

/**
 * 绘制连续的线段
 * 绘制长度为总长度percent的path，drawDirection为绘制的方向，也就是percent的方向
 * @param path
 * @param segPath
 * @param percent
 * @param drawDirection 绘制的方向，用于使用percent绘制
 * @param line 用于获取line相关属性
 */
export function drawSegments(
  path: IPath2D,
  segPath: ISegPath2D,
  percent: number,
  clipRangeByDimension: IClipRangeByDimensionType,
  params?: {
    offsetX?: number;
    offsetY?: number;
    offsetZ?: number;
    drawConnect?: boolean; // 是否是绘制connect区域的效果
    mode?: 'none' | 'connect';
    zeroX?: number;
    zeroY?: number;
  }
) {
  const { offsetX = 0, offsetY = 0, offsetZ = 0, mode = 'none', drawConnect = false } = params || {};
  // none的connect不需要draw
  if (drawConnect && mode === 'none') {
    return;
  }
  if (!segPath) {
    return;
  }
  let needMoveTo: boolean = true;
  const { curves } = segPath;
  if (percent >= 1) {
    if (drawConnect) {
      // return;
      let defined0 = true;
      let lastCurve: ICurve<IPoint>;
      curves.forEach((curve, i) => {
        // step的逻辑
        if (curve.originP1 === curve.originP2) {
          lastCurve = curve;
          return;
        }
        defined0 = drawEachCurve(path, curve, lastCurve, defined0, offsetX, offsetY, offsetZ);

        lastCurve = curve;
      });
    } else {
      curves.forEach(curve => {
        // 跳过这个点
        if (!curve.defined) {
          needMoveTo = true;
          return;
        }
        if (needMoveTo) {
          path.moveTo(curve.p0.x + offsetX, curve.p0.y + offsetY, offsetZ);
        }
        drawSegItem(path, curve, 1, params);
        needMoveTo = false;
      });
    }

    return;
  }
  if (percent <= 0) {
    return;
  }

  let direction: IDirection | undefined;

  if (clipRangeByDimension === 'x') {
    direction = Direction.ROW;
  } else if (clipRangeByDimension === 'y') {
    direction = Direction.COLUMN;
  } else if (clipRangeByDimension === 'auto') {
    direction = segPath.direction;
  }

  // 整个线段的总长度
  const totalLength = segPath.tryUpdateLength(direction);
  // 总需要绘制的长度
  const totalDrawLength = percent * totalLength;
  // 直到上次绘制的长度
  let drawedLengthUntilLast = 0;
  let defined0 = true;
  let lastCurve: ICurve<IPoint> = null;
  for (let i = 0, n = curves.length; i < n; i++) {
    const curve = curves[i];
    const curCurveLength = curve.getLength(direction);
    const _p = (totalDrawLength - drawedLengthUntilLast) / curCurveLength;
    drawedLengthUntilLast += curCurveLength;
    if (_p < 0) {
      break;
    }

    if (drawConnect) {
      // step的逻辑
      if (curve.originP1 === curve.originP2) {
        lastCurve = curve;
        continue;
      }
      defined0 = drawEachCurve(path, curve, lastCurve, defined0, offsetX, offsetY, offsetZ);

      lastCurve = curve;
    } else {
      // 跳过这个点
      if (!curve.defined) {
        needMoveTo = true;
        continue;
      }
      if (needMoveTo) {
        path.moveTo(curve.p0.x + offsetX, curve.p0.y + offsetY, offsetZ);
      }
      drawSegItem(path, curve, min(_p, 1), params);
      needMoveTo = false;
    }
  }
}

export function drawIncrementalSegments(
  path: IPath2D,
  lastSeg: ISegment,
  segments: ISegment,
  params?: {
    offsetX?: number;
    offsetY?: number;
  }
) {
  const { offsetX = 0, offsetY = 0 } = params || {};
  const startP = lastSeg ? lastSeg.points[lastSeg.points.length - 1] : segments.points[0];
  path.moveTo(startP.x + offsetX, startP.y + offsetY);
  segments.points.forEach(p => {
    if (p.defined === false) {
      path.moveTo(p.x + offsetX, p.y + offsetY);
      return;
    }
    path.lineTo(p.x + offsetX, p.y + offsetY);
  });
}

export function drawIncrementalAreaSegments(
  path: IPath2D,
  lastSeg: IAreaSegment,
  segments: IAreaSegment,
  params?: {
    offsetX?: number;
    offsetY?: number;
  }
) {
  const { offsetX = 0, offsetY = 0 } = params || {};
  const { points } = segments;
  // 分段
  const definedPointsList: IPointLike[][] = [];
  let lastIdx = 0;
  for (let i = 0; i < points.length; i++) {
    if (points[i].defined === false) {
      if (lastIdx + 1 !== i) {
        definedPointsList.slice(lastIdx, i);
      }
      lastIdx = i;
    }
  }
  definedPointsList.length === 0;
  definedPointsList.push(points);
  definedPointsList.forEach((points, i) => {
    const startP = lastSeg && i === 0 ? lastSeg.points[lastSeg.points.length - 1] : points[0];
    path.moveTo(startP.x + offsetX, startP.y + offsetY);
    // 绘制上层
    points.forEach(p => {
      if (p.defined === false) {
        path.moveTo(p.x + offsetX, p.y + offsetY);
        return;
      }
      path.lineTo(p.x + offsetX, p.y + offsetY);
    });
    // 绘制下层
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i];
      path.lineTo(p.x1 ?? p.x, p.y1 ?? p.y);
    }
    path.lineTo(startP.x1 ?? startP.x, startP.y1 ?? startP.y);
    path.closePath();
  });
}
