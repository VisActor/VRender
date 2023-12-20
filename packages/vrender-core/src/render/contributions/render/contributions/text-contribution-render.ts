import { BaseRenderContributionTime } from '../../../../common/enums';
import type {
  IContext2d,
  IDrawContext,
  IGraphicAttribute,
  IText,
  ITextRenderContribution,
  IThemeAttribute
} from '../../../../interface';
import { DefaultBaseBackgroundRenderContribution } from './base-contribution-render';

export class DefaultTextBackgroundRenderContribution
  extends DefaultBaseBackgroundRenderContribution
  implements ITextRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;

  drawShape(
    graphic: IText,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    graphicAttribute: Required<IGraphicAttribute>,
    drawContext: IDrawContext,
    fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean
  ) {
    const { background, backgroundMode = graphicAttribute.backgroundMode } = graphic.attribute;
    if (!background) {
      return;
    }

    const b = graphic.AABBBounds;
    if (graphic.backgroundImg && graphic.resources) {
      const res = graphic.resources.get(background);
      if (res.state !== 'success' || !res.data) {
        return;
      }

      context.highPerformanceSave();

      context.setTransformFromMatrix(graphic.parent.globalTransMatrix, true);

      this.doDrawImage(context, res.data, b, backgroundMode);
      context.highPerformanceRestore();
      context.setTransformForCurrent();
    } else {
      context.highPerformanceSave();
      context.fillStyle = background as string;
      context.fillRect(b.x1, b.y1, b.width(), b.height());
      context.highPerformanceRestore();
    }
  }
}

export const defaultTextBackgroundRenderContribution = new DefaultTextBackgroundRenderContribution();

// @injectable()
// export class DefaultTextPopTipRenderContribution
//   extends DefaultBasePopTipRenderContribution
//   implements ITextRenderContribution
// {
//   time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
// }
