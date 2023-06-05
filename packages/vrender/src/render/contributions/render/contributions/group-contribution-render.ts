import { IAABBBounds, isArray } from '@visactor/vutils';
import { injectable } from 'inversify';
import {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IGroup,
  IGroupGraphicAttribute,
  IThemeAttribute
} from '../../../../interface';
import {
  BaseRenderContributionTime,
  DefaultBaseBackgroundRenderContribution,
  IBaseRenderContribution
} from './base-contribution-render';

export const GroupRenderContribution = Symbol.for('GroupRenderContribution');

export interface IGroupRenderContribution extends IBaseRenderContribution {
  drawShape: (
    group: IGroup,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    groupAttribute: Required<IGroupGraphicAttribute>,

    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    doFillOrStroke?: { doFill: boolean; doStroke: boolean }
  ) => void;
}

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
