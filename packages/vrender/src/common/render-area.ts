import { abs, IPoint } from '@visactor/vutils';
import { IAreaCacheItem, ICubicBezierCurve, ICurve, IDirection, ILineCurve, IPath2D } from '../interface';
import { Direction } from './enums';
import { divideCubic } from './segment/curve/cubic-bezier';
import { divideLinear } from './segment/curve/line';

/**
 * 绘制连续的线段
 * 绘制长度为总长度percent的path，drawDirection为绘制的方向，也就是percent的方向
 * @param path
 * @param segPath
 * @param percent
 * @param drawDirection 绘制的方向，用于使用percent绘制
 * @param line 用于获取line相关属性
 */
export function drawAreaSegments(
  path: IPath2D,
  segPath: IAreaCacheItem,
  percent: number,
  params?: {
    offsetX?: number;
    offsetY?: number;
    offsetZ?: number;
    direction?: IDirection;
  }
) {
  // const { offsetX = 0, offsetY = 0 } = params || {};
  // let needMoveTo: boolean = true;
  const { top, bottom } = segPath;
  if (percent >= 1) {
    const topList: ICurve<IPoint>[] = [];
    const bottomList: ICurve<IPoint>[] = [];
    let lastDefined: boolean = true;
    for (let i = 0, n = top.curves.length; i < n; i++) {
      const topCurve = top.curves[i];
      if (lastDefined !== topCurve.defined) {
        if (lastDefined) {
          drawAreaBlock(path, topList, bottomList, params);
          topList.length = 0;
          bottomList.length = 0;
        } else {
          topList.push(topCurve);
          bottomList.push(bottom.curves[n - i - 1]);
        }
        lastDefined = !lastDefined;
      } else {
        if (lastDefined) {
          topList.push(topCurve);
          bottomList.push(bottom.curves[n - i - 1]);
        }
      }
    }
    drawAreaBlock(path, topList, bottomList, params);

    return;
  }
  if (percent <= 0) {
    return;
  }

  let { direction } = params || {};
  const { curves: topCurves } = top;
  const endP = topCurves[topCurves.length - 1].p3 ?? topCurves[topCurves.length - 1].p1;
  const xTotalLength = abs(endP.x - topCurves[0].p0.x);
  const yTotalLength = abs(endP.y - topCurves[0].p0.y);
  direction = direction ?? (xTotalLength > yTotalLength ? Direction.ROW : Direction.COLUMN);
  if (!Number.isFinite(xTotalLength)) {
    direction = Direction.COLUMN;
  }
  if (!Number.isFinite(yTotalLength)) {
    direction = Direction.ROW;
  }

  // x和y必须始终保持同方向
  // 整个线段的总长度（基于水平、垂直方向）
  const totalLength: number = direction === Direction.ROW ? xTotalLength : yTotalLength;

  // 总需要绘制的长度
  const totalDrawLength = percent * totalLength;
  // 直到上次绘制的长度
  let drawedLengthUntilLast = 0;
  let lastDefined: boolean = true;
  const topList: ICurve<IPoint>[] = [];
  const bottomList: ICurve<IPoint>[] = [];
  for (let i = 0, n = top.curves.length; i < n; i++) {
    const topCurve = top.curves[i];
    const curCurveLength = topCurve.getLength(direction);
    const percent = (totalDrawLength - drawedLengthUntilLast) / curCurveLength;
    if (percent < 0) {
      break;
    }
    drawedLengthUntilLast += curCurveLength;
    let tc: ICurve<IPoint> | null = null;
    let bc: ICurve<IPoint> | null = null;
    if (lastDefined !== topCurve.defined) {
      if (lastDefined) {
        drawAreaBlock(path, topList, bottomList, params);
        topList.length = 0;
        bottomList.length = 0;
      } else {
        tc = topCurve;
        bc = bottom.curves[n - i - 1];
      }
      lastDefined = !lastDefined;
    } else {
      if (lastDefined) {
        tc = topCurve;
        bc = bottom.curves[n - i - 1];
      }
    }

    if (tc && bc) {
      if (percent < 1) {
        if (tc.p2 && tc.p3) {
          tc = divideCubic(tc as ICubicBezierCurve, percent)[0];
        } else {
          tc = divideLinear(tc as ILineCurve, percent)[0];
        }
        if (bc.p2 && bc.p3) {
          bc = divideCubic(bc as ICubicBezierCurve, 1 - percent)[1];
        } else {
          bc = divideLinear(bc as ILineCurve, 1 - percent)[1];
        }
      }
      tc.defined = lastDefined;
      bc.defined = lastDefined;
      topList.push(tc);
      bottomList.push(bc);
    }

    tc = null;
    bc = null;
  }
  drawAreaBlock(path, topList, bottomList, params);

  // const totalLength = segPath.tryUpdateLength();

  // // 直到上次绘制的长度
  // let drawedLengthUntilLast = 0;
  // for (let i = 0, n = curves.length; i < n; i++) {
  //   const curve = curves[i];
  //   const curCurveLength = curve.getLength();
  //   const _p = (totalDrawLength - drawedLengthUntilLast) / curCurveLength;
  //   drawedLengthUntilLast += curCurveLength;
  //   if (_p < 0) {
  //     break;
  //   }

  //   // 跳过这个点
  //   if (!curve.defined()) {
  //     needMoveTo = true;
  //     continue;
  //   }
  //   if (needMoveTo) {
  //     path.moveTo(curve.p0.x + offsetX, curve.p0.y + offsetY);
  //   }
  //   drawSegItem(path, curve, min(_p, 1), params);
  //   needMoveTo = false;
  // }
}

function drawAreaBlock(
  path: IPath2D,
  topList: ICurve<IPoint>[],
  bottomList: ICurve<IPoint>[],
  params?: {
    offsetX?: number;
    offsetY?: number;
    offsetZ?: number;
  }
) {
  const { offsetX = 0, offsetY = 0, offsetZ = 0 } = params || {};
  let needMoveTo = true;
  topList.forEach(curve => {
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
  needMoveTo = true;
  for (let i = bottomList.length - 1; i >= 0; i--) {
    const curve = bottomList[i];
    // 跳过这个点
    if (!curve.defined) {
      needMoveTo = true;
      continue;
    }
    if (needMoveTo) {
      // bottom需要直接line绘制
      path.lineTo(curve.p0.x + offsetX, curve.p0.y + offsetY, offsetZ);
    }
    drawSegItem(path, curve, 1, params);
    needMoveTo = false;
  }
}

/**
 * 绘制某个segment
 * @param ctx
 * @param seg
 * @param t 绘制这个segment的比例，t > 0从start到end，t < 0从end到start
 */
function drawSegItem(
  ctx: IPath2D,
  curve: ICurve<IPoint>,
  endPercent: number,
  params?: {
    startLenPercent?: number;
    endLenPercent?: number;
    start?: number;
    offsetX?: number;
    offsetY?: number;
    offsetZ?: number;
  }
) {
  if (!curve.p1) {
    return;
  }
  const { offsetX = 0, offsetY = 0, offsetZ = 0 } = params || {};

  // 完全绘制
  if (endPercent === 1) {
    if (curve.p2 && curve.p3) {
      ctx.bezierCurveTo(
        offsetX + curve.p1.x,
        offsetY + curve.p1.y,
        offsetX + curve.p2.x,
        offsetY + curve.p2.y,
        offsetX + curve.p3.x,
        offsetY + curve.p3.y,
        offsetZ
      );
    } else {
      // linear的线段
      ctx.lineTo(offsetX + curve.p1.x, offsetY + curve.p1.y, offsetZ);
    }
  } else {
    // 绘制一部分
    if (curve.p2 && curve.p3) {
      const [curve1] = divideCubic(curve as ICubicBezierCurve, endPercent);
      ctx.bezierCurveTo(
        offsetX + curve1.p1.x,
        offsetY + curve1.p1.y,
        offsetX + curve1.p2.x,
        offsetY + curve1.p2.y,
        offsetX + curve1.p3.x,
        offsetY + curve1.p3.y,
        offsetZ
      );
    } else {
      // linear的线段
      const p = curve.getPointAt(endPercent);
      ctx.lineTo(offsetX + p.x, offsetY + p.y, offsetZ);
    }
  }
}
