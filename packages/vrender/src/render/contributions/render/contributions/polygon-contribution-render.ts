import { injectable } from 'inversify';
import {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IPolygon,
  IPolygonGraphicAttribute,
  IThemeAttribute
} from '../../../../interface';
import {
  BaseRenderContributionTime,
  DefaultBaseBackgroundRenderContribution,
  DefaultBaseTextureRenderContribution,
  IBaseRenderContribution
} from './base-contribution-render';

export const PolygonRenderContribution = Symbol.for('PolygonRenderContribution');

export interface IPolygonRenderContribution extends IBaseRenderContribution {
  drawShape: (
    Polygon: IPolygon,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    PolygonAttribute: Required<IPolygonGraphicAttribute>,

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
  ) => void;
}

@injectable()
export class DefaultPolygonBackgroundRenderContribution
  extends DefaultBaseBackgroundRenderContribution
  implements IPolygonRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;
}

@injectable()
export class DefaultPolygonTextureRenderContribution
  extends DefaultBaseTextureRenderContribution
  implements IPolygonRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
}
