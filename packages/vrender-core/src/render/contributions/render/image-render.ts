import { inject, injectable, named } from '../../../common/inversify-lite';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../../../common/contribution-provider';
import { getTheme } from '../../../graphic/theme';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IImage,
  IThemeAttribute,
  IGraphicRender,
  IImageRenderContribution,
  IContributionProvider,
  IDrawContext,
  IGraphicRenderDrawParams,
  IRenderService
} from '../../../interface';
import { ImageRenderContribution } from './contributions/constants';
import { fillVisible, runFill } from './utils';
import { IMAGE_NUMBER_TYPE } from '../../../graphic/constants';
import { BaseRenderContributionTime } from '../../../common/enums';
import { isArray } from '@visactor/vutils';
import { createRectPath } from '../../../common/shape/rect';
import { BaseRender } from './base-render';
import { defaultImageBackgroundRenderContribution } from './contributions';

const repeatStr = ['', 'repeat-x', 'repeat-y', 'repeat'];

@injectable()
export class DefaultCanvasImageRender extends BaseRender<IImage> implements IGraphicRender {
  type: 'image';
  numberType: number = IMAGE_NUMBER_TYPE;

  constructor(
    @inject(ContributionProvider)
    @named(ImageRenderContribution)
    protected readonly imageRenderContribitions: IContributionProvider<IImageRenderContribution>
  ) {
    super();
    this.builtinContributions = [defaultImageBackgroundRenderContribution];
    this.init(imageRenderContribitions);
  }

  drawShape(
    image: IImage,
    context: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) {
    // const imageAttribute = graphicService.themeService.getCurrentTheme().imageAttribute;
    const imageAttribute = getTheme(image).image;
    const {
      width = imageAttribute.width,
      height = imageAttribute.height,
      repeatX = imageAttribute.repeatX,
      repeatY = imageAttribute.repeatY,
      cornerRadius = imageAttribute.cornerRadius,
      image: url
    } = image.attribute;

    const data = this.valid(image, imageAttribute, fillCb);
    if (!data) {
      return;
    }
    const { fVisible, sVisible, doFill, doStroke } = data;

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(image, imageAttribute);

    this.beforeRenderStep(image, context, x, y, doFill, false, fVisible, false, imageAttribute, drawContext, fillCb);

    // context.beginPath();
    // context.image(x, y, width, height);

    if (doFill) {
      if (fillCb) {
        fillCb(context, image.attribute, imageAttribute);
      } else if (fVisible) {
        if (!url || !image.resources) {
          return;
        }
        const res = image.resources.get(url);
        if (res.state !== 'success') {
          return;
        }

        // deal with cornerRadius
        let needRestore = false;
        if (cornerRadius === 0 || (isArray(cornerRadius) && (<number[]>cornerRadius).every(num => num === 0))) {
          // 不需要处理圆角
        } else {
          context.beginPath();
          createRectPath(context, x, y, width, height, cornerRadius);
          context.save();
          context.clip();
          needRestore = true;
        }

        context.setCommonStyle(image, image.attribute, x, y, imageAttribute);
        let repeat = 0;
        if (repeatX === 'repeat') {
          repeat |= 0b0001;
        }
        if (repeatY === 'repeat') {
          repeat |= 0b0010;
        }
        if (repeat) {
          const pattern = context.createPattern(res.data, repeatStr[repeat]);
          context.fillStyle = pattern;
          context.fillRect(x, y, width, height);
        } else {
          context.drawImage(res.data, x, y, width, height);
        }

        if (needRestore) {
          context.restore();
        }
      }
    }

    this.afterRenderStep(image, context, x, y, doFill, false, fVisible, false, imageAttribute, drawContext, fillCb);
  }

  draw(image: IImage, renderService: IRenderService, drawContext: IDrawContext) {
    const { image: url } = image.attribute;
    if (!url || !image.resources) {
      return;
    }
    const res = image.resources.get(url);
    if (res.state !== 'success') {
      return;
    }

    const { context } = renderService.drawParams;
    if (!context) {
      return;
    }
    const imageAttribute = getTheme(image).image;
    this._draw(image, imageAttribute, false, drawContext);
  }
}
