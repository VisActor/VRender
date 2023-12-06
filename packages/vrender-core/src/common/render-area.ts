import type { IPoint, IPointLike } from '@visactor/vutils';
import { abs } from '@visactor/vutils';
import type { IAreaCacheItem, ICubicBezierCurve, ICurve, IDirection, ILineCurve, IPath2D } from '../interface';
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
    drawConnect?: boolean; // 是否是绘制connect区域的效果
    mode?: 'none' | 'connect' | 'zero';
    zeroX?: number;
    zeroY?: number;
  }
) {
  const { drawConnect = false, mode = 'none' } = params || {};
  if (drawConnect && mode === 'none') {
    return;
  }
  // let needMoveTo: boolean = true;
  const { top, bottom } = segPath;
  // 如果top和bottom的curves数量不同，那么就跳过
  if (top.curves.length !== bottom.curves.length) {
    return;
  }
  if (percent >= 1) {
    const topList: ICurve<IPoint>[] = [];
    const bottomList: ICurve<IPoint>[] = [];
    let lastDefined: boolean = true;
    if (drawConnect) {
      let defined0 = true;
      let lastCurve: ICurve<IPoint>;
      let lastBottomCurve: ICurve<IPoint>;
      const n = top.curves.length;
      top.curves.forEach((curve, i) => {
        // step的逻辑
        const bototmCurve = bottom.curves[n - i - 1];
        let currentTopCurve = curve;
        let currentBottomCurve = bototmCurve;
        if (curve.originP1 === curve.originP2) {
          lastCurve = curve;
          lastBottomCurve = bototmCurve;
          return;
        }
        if (lastCurve && lastCurve.originP1 === lastCurve.originP2) {
          currentTopCurve = lastCurve;
          currentBottomCurve = lastBottomCurve;
        }
        if (curve.defined) {
          // 非法变合法需要lineTo，合法变非法需要moveTo，初始非法需要moveTo
          if (!defined0) {
            topList.push(currentTopCurve);
            bottomList.push(currentBottomCurve);
            drawAreaConnectBlock(path, topList, bottomList, params);
            topList.length = 0;
            bottomList.length = 0;
            defined0 = !defined0;
          }
        } else {
          // 找到合法的点
          const { originP1, originP2 } = curve;
          let validTopCurve: ICurve<IPoint>;
          let validBottomCurve: ICurve<IPoint>;
          if (originP1 && originP1.defined !== false) {
            validTopCurve = currentTopCurve;
            validBottomCurve = currentBottomCurve;
          } else if (originP1 && originP2.defined !== false) {
            validTopCurve = curve;
            validBottomCurve = bototmCurve;
          }
          // 合法/（初始）变非法，moveTo
          if (defined0) {
            defined0 = !defined0;
            topList.push(validTopCurve || curve);
            bottomList.push(validBottomCurve || bototmCurve);
          } else {
            // 非法变非法/合法，看情况要不要lineTo
            if (validTopCurve) {
              // 非法变合法，需要lineTo
              defined0 = !defined0;
              topList.push(validTopCurve || curve);
              bottomList.push(validBottomCurve || bototmCurve);
              drawAreaConnectBlock(path, topList, bottomList, params);
              topList.length = 0;
              bottomList.length = 0;
            }
          }
        }
        lastCurve = curve;
      });
      drawAreaConnectBlock(path, topList, bottomList, params);
    } else {
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
    }

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
  let defined0 = true;
  let lastTopCurve: ICurve<IPoint>;
  let lastBottomCurve: ICurve<IPoint>;
  for (let i = 0, n = top.curves.length; i < n; i++) {
    const topCurve = top.curves[i];
    const curCurveLength = topCurve.getLength(direction);
    const percent = (totalDrawLength - drawedLengthUntilLast) / curCurveLength;
    if (percent < 0) {
      break;
    }
    drawedLengthUntilLast += curCurveLength;

    if (drawConnect) {
      // step的逻辑
      const bototmCurve = bottom.curves[n - i - 1];
      let currentTopCurve = topCurve;
      let currentBottomCurve = bototmCurve;
      if (topCurve.originP1 === topCurve.originP2) {
        lastTopCurve = topCurve;
        lastBottomCurve = bototmCurve;
        continue;
      }
      if (lastTopCurve && lastTopCurve.originP1 === lastTopCurve.originP2) {
        currentTopCurve = lastTopCurve;
        currentBottomCurve = lastBottomCurve;
      }
      if (topCurve.defined) {
        // 非法变合法需要lineTo，合法变非法需要moveTo，初始非法需要moveTo
        if (!defined0) {
          topList.push(currentTopCurve);
          bottomList.push(currentBottomCurve);
          drawAreaConnectBlock(path, topList, bottomList, params);
          topList.length = 0;
          bottomList.length = 0;
          defined0 = !defined0;
        }
      } else {
        // 找到合法的点
        const { originP1, originP2 } = topCurve;
        let validTopCurve: ICurve<IPoint>;
        let validBottomCurve: ICurve<IPoint>;
        if (originP1 && originP1.defined !== false) {
          validTopCurve = currentTopCurve;
          validBottomCurve = currentBottomCurve;
        } else if (originP1 && originP2.defined !== false) {
          validTopCurve = topCurve;
          validBottomCurve = bototmCurve;
        }
        // 合法/（初始）变非法，moveTo
        if (defined0) {
          defined0 = !defined0;
          topList.push(validTopCurve || topCurve);
          bottomList.push(validBottomCurve || bototmCurve);
        } else {
          // 非法变非法/合法，看情况要不要lineTo
          if (validTopCurve) {
            // 非法变合法，需要lineTo
            defined0 = !defined0;
            topList.push(validTopCurve || topCurve);
            bottomList.push(validBottomCurve || bototmCurve);
            drawAreaConnectBlock(path, topList, bottomList, params);
            topList.length = 0;
            bottomList.length = 0;
          }
        }
      }
      lastTopCurve = topCurve;
      // drawAreaBlock(path, topList, bottomList, params);
    } else {
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
  }

  if (drawConnect) {
    drawAreaConnectBlock(path, topList, bottomList, params);
  } else {
    drawAreaBlock(path, topList, bottomList, params);
  }

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

function drawAreaConnectBlock(
  path: IPath2D,
  topList: ICurve<IPoint>[],
  bottomList: ICurve<IPoint>[],
  params?: {
    offsetX?: number;
    offsetY?: number;
    offsetZ?: number;
    mode?: 'none' | 'connect' | 'zero';
    zeroX?: number;
    zeroY?: number;
  }
) {
  if (topList.length < 2) {
    return;
  }
  const { offsetX = 0, offsetY = 0, offsetZ = 0, mode } = params || {};
  let curve = topList[0];
  // mode不支持zero
  path.moveTo(curve.p0.x + offsetX, curve.p0.y + offsetY, offsetZ);
  curve = topList[topList.length - 1];
  let end = curve.p3 || curve.p1;
  path.lineTo(end.x + offsetX, end.y + offsetY, offsetZ);

  curve = bottomList[bottomList.length - 1];
  path.lineTo(curve.p0.x + offsetX, curve.p0.y + offsetY, offsetZ);
  curve = bottomList[0];
  end = curve.p3 || curve.p1;
  path.lineTo(end.x + offsetX, end.y + offsetY, offsetZ);

  path.closePath();
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
  path.closePath();
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
