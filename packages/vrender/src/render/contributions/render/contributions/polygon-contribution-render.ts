import { injectable } from '../../../../common/inversify-lite';
import type { IPolygonRenderContribution } from '../../../../interface';
import {
  DefaultBaseBackgroundRenderContribution,
  DefaultBaseTextureRenderContribution
} from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';

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
