import {
  getScaledStroke,
  type IContext2d,
  type IGraphicAttribute,
  type IMarkAttribute,
  type IThemeAttribute
} from '@visactor/vrender-core';
import type { IPointLike } from '@visactor/vutils';

export const commonStrokeCb = (
  context: IContext2d,
  pickContext: IContext2d,
  symbolAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
  themeAttribute: IThemeAttribute,
  pickPoint: IPointLike
) => {
  const lineWidth = symbolAttribute.lineWidth || themeAttribute.lineWidth;
  const pickStrokeBuffer = symbolAttribute.pickStrokeBuffer || themeAttribute.pickStrokeBuffer;
  const keepStrokeScale = symbolAttribute.keepStrokeScale || themeAttribute.keepStrokeScale;
  pickContext.lineWidth = keepStrokeScale
    ? lineWidth + pickStrokeBuffer
    : getScaledStroke(pickContext, lineWidth + pickStrokeBuffer, pickContext.dpr);
  return context.isPointInStroke(pickPoint.x, pickPoint.y);
};
