import { inject, injectable, named } from 'inversify';
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

const repeatStr = ['', 'repeat-x', 'repeat-y', 'repeat'];

@injectable()
export class DefaultCanvasImageRender implements IGraphicRender {
  type: 'image';
  numberType: number = IMAGE_NUMBER_TYPE;

  protected _imageRenderContribitions: IImageRenderContribution[];

  constructor(
    @inject(ContributionProvider)
    @named(ImageRenderContribution)
    protected readonly imageRenderContribitions: IContributionProvider<IImageRenderContribution>
  ) {}

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
      fill = imageAttribute.fill,
      width = imageAttribute.width,
      height = imageAttribute.height,
      opacity = imageAttribute.opacity,
      fillOpacity = imageAttribute.fillOpacity,
      visible = imageAttribute.visible,
      repeatX = imageAttribute.repeatX,
      repeatY = imageAttribute.repeatY,
      image: url
    } = image.attribute;

    // 不绘制或者透明
    const fVisible = fillVisible(opacity, fillOpacity);
    const doFill = runFill(fill);

    if (!(image.valid && visible)) {
      return;
    }

    if (!doFill) {
      return;
    }

    // 如果存在fillCb和strokeCb，那就不直接跳过
    if (!(fVisible || fillCb)) {
      return;
    }

    if (!this._imageRenderContribitions) {
      this._imageRenderContribitions = this.imageRenderContribitions.getContributions() || [];
    }
    this._imageRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.beforeFillStroke) {
        // c.useStyle && context.setCommonStyle(image, image.attribute, x, y, imageAttribute);
        c.drawShape(image, context, x, y, doFill, false, fVisible, false, imageAttribute, drawContext, fillCb);
      }
    });

    // context.beginPath();
    // context.image(x, y, width, height);

    // shadow
    context.setShadowStyle && context.setShadowStyle(image, imageAttribute);

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
      }
    }

    this._imageRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.afterFillStroke) {
        // c.useStyle && context.setCommonStyle(image, image.attribute, x, y, imageAttribute);
        c.drawShape(image, context, x, y, doFill, false, fVisible, false, imageAttribute, drawContext, fillCb);
      }
    });
  }

  draw(image: IImage, renderService: IRenderService, drawContext: IDrawContext) {
    const { context } = renderService.drawParams;
    if (!context) {
      return;
    }

    // const imageAttribute = graphicService.themeService.getCurrentTheme().imageAttribute;
    const imageAttribute = getTheme(image).image;
    let { x = imageAttribute.x, y = imageAttribute.y } = image.attribute;
    const { image: url } = image.attribute;
    if (!url || !image.resources) {
      return;
    }
    const res = image.resources.get(url);
    if (res.state !== 'success') {
      return;
    }

    context.highPerformanceSave();
    if (!image.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      context.transformFromMatrix(image.transMatrix, true);
    } else {
      const point = image.getOffsetXY(imageAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      context.setTransformForCurrent();
    }

    this.drawShape(image, context, x, y, drawContext);

    context.highPerformanceRestore();
  }
}
