import type {
  IGraphicAttribute,
  IContext2d,
  IThemeAttribute,
  IImageRenderContribution,
  IDrawContext,
  IMarkAttribute
} from '../../../../interface';
import { defaultBaseBackgroundRenderContribution } from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';
import { DefaultRectRenderContribution } from './rect-contribution-render';

export class DefaultImageRenderContribution extends DefaultRectRenderContribution implements IImageRenderContribution {
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
  useStyle: boolean = true;
  order: number = 0;
  drawShape(
    image: any,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    rectAttribute: any,
    drawContext: IDrawContext,
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
  ) {
    return super.drawShape(
      image,
      context,
      x,
      y,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      rectAttribute,
      drawContext,
      fillCb,
      strokeCb
    );
  }
}

export const defaultImageRenderContribution = new DefaultImageRenderContribution();
export const defaultImageBackgroundRenderContribution = defaultBaseBackgroundRenderContribution;
