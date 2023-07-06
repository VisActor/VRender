import { injectable } from 'inversify';
import type { IPolygonRenderContribution } from '../../../../interface';
import {
  DefaultBaseBackgroundRenderContribution,
  DefaultBaseTextureRenderContribution
} from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';

export const PolygonRenderContribution = Symbol.for('PolygonRenderContribution');

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
