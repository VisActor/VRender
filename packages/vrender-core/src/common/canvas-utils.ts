import type { IColor, IConicalGradient, ILinearGradient, IRadialGradient } from '../interface/color';
import type { IContext2d, ITransform } from '../interface';
import { ICommonStyleParams } from '../interface';
import type { IBoundsLike } from '@visactor/vutils';
import { IMatrix, isArray } from '@visactor/vutils';

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
  c: string | IColor | Array<string | IColor> | boolean,
  params: { AABBBounds?: IBoundsLike; attribute?: Partial<ITransform> },
  offsetX: number,
  offsetY: number
): string | CanvasGradient {
  if (!c || c === true) {
    return 'black';
  }
  let result: string | CanvasGradient | undefined;
  let color: string | IColor;
  if (isArray(c)) {
    for (let i = 0; i < c.length; i++) {
      color = c[i];
      if (color) {
        break;
      }
    }
  } else {
    color = c;
  }
  if (typeof color === 'string') {
    return color;
  }
  if (color.gradient === 'linear') {
    result = createLinearGradient(context, color, params, offsetX, offsetY);
  } else if (color.gradient === 'conical') {
    result = createConicGradient(context, color, params, offsetX, offsetY);
  } else if (color.gradient === 'radial') {
    result = createRadialGradient(context, color, params, offsetX, offsetY);
  }
  return result || 'orange';
}

function createLinearGradient(
  context: IContext2d,
  color: ILinearGradient,
  params: { AABBBounds?: IBoundsLike; attribute?: Partial<ITransform> },
  offsetX: number = 0,
  offsetY: number = 0
) {
  const bounds = params.AABBBounds;
  if (!bounds) {
    return;
  }
  let w = bounds.x2 - bounds.x1;
  let h = bounds.y2 - bounds.y1;
  let x = bounds.x1 - offsetX;
  let y = bounds.y1 - offsetY;
  if (params.attribute) {
    const { scaleX = 1, scaleY = 1 } = params.attribute;
    if (scaleX * scaleY === 0) {
      return;
    }
    w /= scaleX;
    h /= scaleY;
    x /= scaleX;
    y /= scaleY;
  }

  const canvasGradient = context.createLinearGradient(
    x + (color.x0 ?? 0) * w,
    y + (color.y0 ?? 0) * h,
    x + (color.x1 ?? 1) * w,
    y + (color.y1 ?? 0) * h
  );
  color.stops.forEach(stop => {
    canvasGradient.addColorStop(stop.offset, stop.color);
  });
  return canvasGradient;
}

function createRadialGradient(
  context: IContext2d,
  color: IRadialGradient,
  params: { AABBBounds?: IBoundsLike; attribute?: Partial<ITransform> },
  offsetX: number = 0,
  offsetY: number = 0
) {
  const bounds = params.AABBBounds;
  if (!bounds) {
    return;
  }
  let w = bounds.x2 - bounds.x1;
  let h = bounds.y2 - bounds.y1;
  let x = bounds.x1 - offsetX;
  let y = bounds.y1 - offsetY;
  if (params.attribute) {
    const { scaleX = 1, scaleY = 1 } = params.attribute;
    if (scaleX * scaleY === 0) {
      return;
    }
    x /= scaleX;
    y /= scaleY;
    w /= scaleX;
    h /= scaleY;
  }
  const canvasGradient = context.createRadialGradient(
    x + (color.x0 ?? 0.5) * w,
    y + (color.y0 ?? 0.5) * h,
    Math.max(w, h) * (color.r0 ?? 0),
    x + (color.x1 ?? 0.5) * w,
    y + (color.y1 ?? 0.5) * h,
    Math.max(w, h) * (color.r1 ?? 0.5)
  );
  color.stops.forEach(stop => {
    canvasGradient.addColorStop(stop.offset, stop.color);
  });
  return canvasGradient;
}

function createConicGradient(
  context: IContext2d,
  color: IConicalGradient,
  params: { AABBBounds?: IBoundsLike; attribute?: Partial<ITransform> },
  offsetX: number = 0,
  offsetY: number = 0
) {
  const bounds = params.AABBBounds;
  if (!bounds) {
    return;
  }
  let w = bounds.x2 - bounds.x1;
  let h = bounds.y2 - bounds.y1;
  let x = bounds.x1 - offsetX;
  let y = bounds.y1 - offsetY;
  if (params.attribute) {
    const { scaleX = 1, scaleY = 1 } = params.attribute;
    if (scaleX * scaleY === 0) {
      return;
    }
    w /= scaleX;
    h /= scaleY;
    x /= scaleX;
    y /= scaleY;
  }

  const canvasGradient = context.createConicGradient(
    x + (color.x ?? 0) * w,
    y + (color.y ?? 0) * h,
    color.startAngle,
    color.endAngle
  );
  color.stops.forEach(stop => {
    canvasGradient.addColorStop(stop.offset, stop.color);
  });

  let deltaAngle;
  return (canvasGradient as any).GetPattern(w + x, h + y, deltaAngle);
}
