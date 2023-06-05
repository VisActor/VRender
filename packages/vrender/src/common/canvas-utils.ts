import { IColor, IConicalGradient, ILinearGradient, IRadialGradient } from '../interface/color';
import { IContext2d } from '../interface';
import { IBoundsLike } from '@visactor/vutils';

export function getScaledStroke(context: IContext2d, width: number, dpr: number) {
  let strokeWidth = width;
  const { a, b, c, d } = context.currentMatrix;
  const scaleX = Math.sign(a) * Math.sqrt(a * a + b * b);
  const scaleY = Math.sign(d) * Math.sqrt(c * c + d * d);
  // 如果没有scaleX和scaleY，那么认为什么都不用绘制
  if (scaleX + scaleY === 0) {
    return 0;
  }
  strokeWidth = (strokeWidth / Math.abs(scaleX + scaleY)) * 2 * dpr;
  return strokeWidth;
}

export function createColor(
  context: IContext2d,
  color: string | IColor,
  params: { AABBBounds?: IBoundsLike },
  offsetX: number,
  offsetY: number
): string | CanvasGradient {
  if (!color) {
    return 'black';
  }
  let result: string | CanvasGradient | undefined;
  if (typeof color === 'string') {
    return color;
  }
  if (color.gradient === 'linear') {
    result = createLinearGradient(context, color, params.AABBBounds, offsetX, offsetY);
  } else if (color.gradient === 'conical') {
    result = createConicGradient(context, color, params.AABBBounds, offsetX, offsetY);
  } else if (color.gradient === 'radial') {
    result = createRadialGradient(context, color, params.AABBBounds, offsetX, offsetY);
  }
  return result || 'orange';
}

function createLinearGradient(
  context: IContext2d,
  color: ILinearGradient,
  bounds: IBoundsLike,
  offsetX: number,
  offsetY: number
) {
  const w = bounds.x2 - bounds.x1;
  const h = bounds.y2 - bounds.y1;
  const x = bounds.x1;
  const y = bounds.y1;
  const canvasGradient = context.createLinearGradient(
    x + (color.x0 || 0) * w,
    y + (color.y0 || 0) * h,
    x + (color.x1 || 1) * w,
    y + (color.y1 || 0) * h
  );
  color.stops.forEach(stop => {
    canvasGradient.addColorStop(stop.offset, stop.color);
  });
  return canvasGradient;
}

function createRadialGradient(
  context: IContext2d,
  color: IRadialGradient,
  bounds: IBoundsLike,
  offsetX: number,
  offsetY: number
) {
  const w = bounds.x2 - bounds.x1;
  const h = bounds.y2 - bounds.y1;
  const x = bounds.x1;
  const y = bounds.y1;
  const canvasGradient = context.createRadialGradient(
    x + (color.x0 || 0.5) * w,
    y + (color.y0 || 0.5) * h,
    Math.max(w, h) * (color.r0 || 0),
    x + (color.x1 || 0.5) * w,
    y + (color.y1 || 0.5) * h,
    Math.max(w, h) * (color.r1 || 0.5)
  );
  color.stops.forEach(stop => {
    canvasGradient.addColorStop(stop.offset, stop.color);
  });
  return canvasGradient;
}

function createConicGradient(
  context: IContext2d,
  color: IConicalGradient,
  bounds: IBoundsLike,
  offsetX: number,
  offsetY: number
) {
  if (!bounds) {
    return;
  }
  const w = bounds.x2 - bounds.x1;
  const h = bounds.y2 - bounds.y1;
  const x = bounds.x1 || 0;
  const y = bounds.y1 || 0;

  const canvasGradient = context.createConicGradient(
    x + (color.x || 0) * w,
    y + (color.y || 0) * h,
    color.startAngle,
    color.endAngle
  );
  color.stops.forEach(stop => {
    canvasGradient.addColorStop(stop.offset, stop.color);
  });

  let deltaAngle;
  return (canvasGradient as any).GetPattern(w + x, h + y, deltaAngle);
}
