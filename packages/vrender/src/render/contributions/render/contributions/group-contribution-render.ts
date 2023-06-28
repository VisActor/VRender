import { injectable } from 'inversify';
import type {
  IGraphicAttribute,
  IContext2d,
  IGroup,
  IThemeAttribute,
  IGroupRenderContribution
} from '../../../../interface';
import { DefaultBaseBackgroundRenderContribution } from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';

export const GroupRenderContribution = Symbol.for('GroupRenderContribution');

@injectable()
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

    fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean
  ) {
    const { background } = graphic.attribute;
    if (!background) {
      return;
    }

    if (graphic.backgroundImg && graphic.resources) {
      const res = graphic.resources.get(background);
      if (res.state !== 'success' || !res.data) {
        return;
      }

      context.highPerformanceSave();

      context.setTransformFromMatrix(graphic.parent.globalTransMatrix, true);
      const b = graphic.AABBBounds;
      context.drawImage(res.data, b.x1, b.y1, b.width(), b.height());
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
