import { injectable } from 'inversify';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IImage,
  IImageGraphicAttribute,
  IThemeAttribute
} from '../../../../interface';
import { getTheme } from '../../../../graphic/theme';
import type { IBaseRenderContribution } from './base-contribution-render';
import { BaseRenderContributionTime, DefaultBaseBackgroundRenderContribution } from './base-contribution-render';

export const ImageRenderContribution = Symbol.for('ImageRenderContribution');

export interface IImageRenderContribution extends IBaseRenderContribution {
  drawShape: (
    image: IImage,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    imageAttribute: Required<IImageGraphicAttribute>,

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
export class DefaultImageBackgroundRenderContribution
  extends DefaultBaseBackgroundRenderContribution
  implements IImageRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;

  drawShape(
    graphic: IImage,
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
    const { background, width, height } = graphic.attribute;
    if (!background) {
      return;
    }

    if (!graphic.backgroundImg) {
      context.beginPath();
      const b = graphic.AABBBounds;
      context.rect(x, y, b.width(), b.height());
      context.fillStyle = background as string;
      context.globalAlpha = 1;
      context.fill();
    } else {
      const res = graphic.resources.get(background);
      if (res.state !== 'success' || !res.data) {
        return;
      }
      context.save();
      if (graphic.parent && !graphic.transMatrix.onlyTranslate()) {
        const groupAttribute = getTheme(graphic.parent).group;
        const { scrollX = groupAttribute.scrollX, scrollY = groupAttribute.scrollY } = graphic.parent.attribute;
        context.setTransformFromMatrix(graphic.parent.globalTransMatrix, true);
        context.translate(scrollX, scrollY);
      }
      // context.clip();
      const b = graphic.AABBBounds;
      context.drawImage(res.data, b.x1, b.y1, b.width(), b.height());
      context.restore();
      if (!graphic.transMatrix.onlyTranslate()) {
        context.setTransformForCurrent();
      }
    }
  }
}
