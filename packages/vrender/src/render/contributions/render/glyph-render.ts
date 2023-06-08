import { injectable } from 'inversify';
import { GLYPH_NUMBER_TYPE } from '../../../graphic/glyph';
import { getTheme } from '../../../graphic/theme';
import type { IGraphicAttribute, IContext2d, IGlyph, IMarkAttribute, IThemeAttribute } from '../../../interface';
import { IRect } from '../../../interface';
import type { IDrawContext, IRenderService } from '../../render-service';
import type { IGraphicRender, IGraphicRenderDrawParams } from './graphic-render';

@injectable()
export class DefaultCanvasGlyphRender implements IGraphicRender {
  type: 'glyph';
  numberType: number = GLYPH_NUMBER_TYPE;

  // constructor() {}

  drawShape(
    glyph: IGlyph,
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
  ) {
    if (!drawContext.drawContribution) {
      return;
    }
    glyph.getSubGraphic().forEach(item => {
      const renderer = drawContext.drawContribution.getRenderContribution(item);
      if (renderer && renderer.drawShape) {
        renderer.drawShape(item, context, x, y, drawContext, params, fillCb, strokeCb);
      }
    });
  }

  draw(glyph: IGlyph, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    context.highPerformanceSave();

    if (!drawContext.drawContribution) {
      return;
    }
    const glyphTheme = getTheme(glyph);
    const subGraphic = glyph.getSubGraphic();
    subGraphic.length &&
      subGraphic.forEach(g => {
        drawContext.drawContribution.renderItem(g, drawContext, { theme: glyphTheme });
      });

    context.highPerformanceRestore();
  }
}
