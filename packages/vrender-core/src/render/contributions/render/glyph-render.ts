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
import { BaseRender } from './base-render';

@injectable()
export class DefaultCanvasGlyphRender extends BaseRender<IGlyph> implements IGraphicRender {
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
    const glyphTheme = getTheme(glyph);
    const subGraphic = glyph.getSubGraphic();
    subGraphic.length &&
      subGraphic.forEach(g => {
        drawContext.drawContribution.renderItem(g, drawContext, { theme: glyphTheme });
      });
  }

  draw(glyph: IGlyph, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const glyphAttr = getTheme(glyph).glyph;
    this._draw(glyph, glyphAttr, false, drawContext, params);
  }
}
