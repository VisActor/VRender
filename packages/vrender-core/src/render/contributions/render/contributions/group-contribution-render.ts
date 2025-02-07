import type {
  IGraphicAttribute,
  IContext2d,
  IGroup,
  IThemeAttribute,
  IGroupRenderContribution,
  IDrawContext
} from '../../../../interface';
import { DefaultBaseBackgroundRenderContribution } from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';

export class DefaultGroupBackgroundRenderContribution
  extends DefaultBaseBackgroundRenderContribution
  implements IGroupRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;

  drawShape(
    graphic: IGroup,
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
    const {
      background,
      backgroundMode = graphicAttribute.backgroundMode,
      backgroundFit = graphicAttribute.backgroundFit,
      backgroundKeepAspectRatio = graphicAttribute.backgroundKeepAspectRatio,
      backgroundScale = graphicAttribute.backgroundScale,
      backgroundOffsetX = graphicAttribute.backgroundOffsetX,
      backgroundOffsetY = graphicAttribute.backgroundOffsetY
    } = graphic.attribute;
    if (!background) {
      return;
    }

    if (graphic.backgroundImg && graphic.resources) {
      const res = graphic.resources.get(background as any);
      if (res.state !== 'success' || !res.data) {
        return;
      }

      context.highPerformanceSave();

      context.setTransformFromMatrix(graphic.parent.globalTransMatrix, true);
      const b = graphic.AABBBounds;
      this.doDrawImage(context, res.data, b, {
        backgroundMode,
        backgroundFit,
        backgroundKeepAspectRatio,
        backgroundScale,
        backgroundOffsetX,
        backgroundOffsetY
      });
      context.highPerformanceRestore();
      context.setTransformForCurrent();
    } else {
      context.highPerformanceSave();
      context.fillStyle = background as string;
      context.fill();
      context.highPerformanceRestore();
    }
  }
}

export const defaultGroupBackgroundRenderContribution = new DefaultGroupBackgroundRenderContribution();
