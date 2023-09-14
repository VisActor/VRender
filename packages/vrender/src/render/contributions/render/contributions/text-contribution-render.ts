import { injectable } from '../../../../common/inversify-lite';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IArc,
  IArcGraphicAttribute,
  IThemeAttribute,
  IArcRenderContribution,
  ITextRenderContribution
} from '../../../../interface';
import { getScaledStroke } from '../../../../common/canvas-utils';
import {
  DefaultBaseBackgroundRenderContribution,
  // DefaultBasePopTipRenderContribution,
  DefaultBaseTextureRenderContribution
} from './base-contribution-render';
import { drawArcPath } from '../utils';
import { BaseRenderContributionTime } from '../../../../common/enums';

// @injectable()
// export class DefaultTextPopTipRenderContribution
//   extends DefaultBasePopTipRenderContribution
//   implements ITextRenderContribution
// {
//   time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
// }
