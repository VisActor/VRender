import type { IPoint } from '@visactor/vutils';
import type { ICubicBezierCurve, ICurve, IPath2D } from '../interface';
import { divideCubic } from './segment/curve/cubic-bezier';

/**
 * 绘制某个segment
 * @param ctx
 * @param seg
 * @param t 绘制这个segment的比例，t > 0从start到end，t < 0从end到start
 */
export function drawSegItem(
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
