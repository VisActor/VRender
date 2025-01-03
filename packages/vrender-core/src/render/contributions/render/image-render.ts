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
import { isArray, isString } from '@visactor/vutils';
import { createRectPath } from '../../../common/shape/rect';
import { BaseRender } from './base-render';
import { defaultImageBackgroundRenderContribution, defaultImageRenderContribution } from './contributions';
import { ResourceLoader } from '../../../resource-loader/loader';

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
    this.builtinContributions = [defaultImageRenderContribution, defaultImageBackgroundRenderContribution];
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
    ) => boolean,
    strokeCb?: (
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
      x: originX = imageAttribute.x,
      y: originY = imageAttribute.y,
      cornerRadius = imageAttribute.cornerRadius,
      fillStrokeOrder = imageAttribute.fillStrokeOrder,
      image: url
    } = image.attribute;

    const data = this.valid(image, imageAttribute, fillCb);
    if (!data) {
      return;
    }
    const { fVisible, sVisible, doFill, doStroke } = data;

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
      needRestore = true;
    }

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(image, image.attribute, imageAttribute);
    // context.beginPath();
    // context.image(x, y, width, height);

    const _runFill = () => {
      if (doFill) {
        if (fillCb) {
          fillCb(context, image.attribute, imageAttribute);
        } else if (fVisible) {
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
            context.translate(x, y, true);
            context.fillRect(0, 0, width, height);
            context.translate(-x, -y, true);
          } else {
            context.drawImage(res.data, x, y, width, height);
          }
        }
      }
    };

    const _runStroke = () => {
      if (doStroke) {
        if (strokeCb) {
          strokeCb(context, image.attribute, imageAttribute);
        } else if (sVisible) {
          context.setStrokeStyle(image, image.attribute, originX - x, originY - y, imageAttribute);
          context.stroke();
        }
      }
    };

    if (!fillStrokeOrder) {
      if (needRestore) {
        context.save();
        context.clip();
      }
      this.beforeRenderStep(image, context, x, y, doFill, false, fVisible, false, imageAttribute, drawContext, fillCb);
      _runFill();
      if (needRestore) {
        context.restore();
      }
      _runStroke();
    } else {
      _runStroke();
      if (needRestore) {
        context.save();
        context.clip();
      }
      this.beforeRenderStep(image, context, x, y, doFill, false, fVisible, false, imageAttribute, drawContext, fillCb);
      _runFill();
      if (needRestore) {
        context.restore();
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
    // if (res.state !== 'success') {
    //   return;
    // }
    if (res.state === 'loading' && isString(url)) {
      ResourceLoader.improveImageLoading(url);
      return;
    } else if (res.state !== 'success') {
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
