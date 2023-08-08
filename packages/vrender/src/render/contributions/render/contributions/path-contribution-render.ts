import { injectable } from 'inversify';
import type { IPathRenderContribution } from '../../../../interface';
import {
  DefaultBaseBackgroundRenderContribution,
  DefaultBaseTextureRenderContribution
} from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';

@injectable()
export class DefaultPathBackgroundRenderContribution
  extends DefaultBaseBackgroundRenderContribution
  implements IPathRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;
}

@injectable()
export class DefaultPathTextureRenderContribution
  extends DefaultBaseTextureRenderContribution
  implements IPathRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
}
