import { injectable } from '../../../common/inversify-lite';
import { getTheme } from '../../../graphic/theme';
import { GLYPH_NUMBER_TYPE } from '../../../graphic/constants';
import type {
  IGraphicAttribute,
  IContext2d,
  IGlyph,
  IMarkAttribute,
  IThemeAttribute,
  IDrawContext,
  IRenderService,
  IGraphicRender,
  IGraphicRenderDrawParams
} from '../../../interface';

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
