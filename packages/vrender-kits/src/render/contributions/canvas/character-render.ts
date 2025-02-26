import type {
  IContext2d,
  IDrawContext,
  IGraphicAttribute,
  IGraphicRender,
  IGraphicRenderDrawParams,
  IMarkAttribute,
  IRenderService,
  IThemeAttribute
} from '@visactor/vrender-core';
import { DefaultCanvasRectRender, getTheme, injectable } from '@visactor/vrender-core';
import { CHARACTER_NUMBER_TYPE } from '../../../graphic/character/character';
import type { ICharacterGraphic } from '../../../graphic/character/interface';
import { max } from '@visactor/vutils';

@injectable()
export class DefaultCanvasCharacterRender extends DefaultCanvasRectRender implements IGraphicRender {
  type: 'glyph';
  numberType: number = CHARACTER_NUMBER_TYPE;

  drawShape(
    character: ICharacterGraphic,
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
    if (!drawContext.drawContribution) {
      return;
    }
    character.getPartsMap().forEach(part => {
      const renderer = drawContext.drawContribution.getRenderContribution(part.graphic);
      if (renderer && renderer.drawShape) {
        renderer.drawShape(part.graphic, context, x, y, drawContext, params, fillCb, strokeCb);
      }
    });
  }

  draw(
    character: ICharacterGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams
  ) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    context.highPerformanceSave();
    // character直接transform
    // 基于宽高缩放
    const { width, height } = character.attribute;
    const matrix = character.transMatrix.clone();
    const scale = max(width, height);
    matrix.scale(scale, scale);
    context.transformFromMatrix(matrix, true);

    if (!drawContext.drawContribution) {
      return;
    }

    const skeletonRootGraphic = character.skeletonRoot.getGraphic();
    drawContext.drawContribution.renderGroup(skeletonRootGraphic, drawContext, matrix);

    context.highPerformanceRestore();
  }
}
