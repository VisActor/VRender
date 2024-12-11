import type {
  IContext2d,
  IDrawContext,
  IGraphicAttribute,
  IGraphicRender,
  IGraphicRenderDrawParams,
  IMarkAttribute,
  IThemeAttribute
} from '@visactor/vrender-core';
import { DefaultCanvasRectRender, getTheme, injectable } from '@visactor/vrender-core';
import { LOTTIE_NUMBER_TYPE } from '../../../graphic/constants';
import type { ILottie } from '../../../graphic/interface/lottie';

@injectable()
export class DefaultCanvasLottieRender extends DefaultCanvasRectRender implements IGraphicRender {
  type: 'glyph';
  numberType: number = LOTTIE_NUMBER_TYPE;

  drawShape(
    lottie: ILottie,
    context: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ): void {
    const _fillCb = fillCb || (() => this._drawShape.call(this, lottie, context, x, y, drawContext, params));
    super.drawShape(lottie, context, x, y, drawContext, params, _fillCb, strokeCb);
  }

  _drawShape(
    lottie: ILottie,
    context: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams
  ): void {
    const lottieAttribute = this.tempTheme ?? getTheme(lottie, params?.theme).rect;
    const { x: originX = lottieAttribute.x, y: originY = lottieAttribute.y } = lottie.attribute;
    context.setCommonStyle(lottie, lottie.attribute, originX - x, originY - y, lottieAttribute);
    // 设置pattern，绘制lottie
    const canvas = lottie.canvas;
    if (canvas) {
      // const _ctx = canvas.getContext('2d');
      const pattern = context.createPattern(canvas, 'no-repeat');
      const dpr = context.dpr;
      pattern.setTransform && pattern.setTransform(new DOMMatrix([1 / dpr, 0, 0, 1 / dpr, x, y]));
      context.fillStyle = pattern;
    }
    context.fill();
  }
}
