import type {
  IContext2d,
  IContributionProvider,
  IDrawContext,
  IGraphicAttribute,
  IGraphicRender,
  IGraphicRenderDrawParams,
  IImageRenderContribution,
  IMarkAttribute,
  IRenderService,
  IThemeAttribute
} from '@visactor/vrender-core';
import {
  BaseRenderContributionTime,
  ContributionProvider,
  DefaultCanvasImageRender,
  DefaultRectRenderContribution,
  getTheme,
  ImageRenderContribution,
  inject,
  injectable,
  named
} from '@visactor/vrender-core';
import { GIFIMAGE_NUMBER_TYPE } from '../../../graphic/constants';
import type { IGifImage } from '../../../interface/gif-image';

@injectable()
export class DefaultCanvasGifImageRender extends DefaultCanvasImageRender implements IGraphicRender {
  type: 'image';
  numberType: number = GIFIMAGE_NUMBER_TYPE;

  constructor(
    @inject(ContributionProvider)
    @named(ImageRenderContribution)
    protected readonly imageRenderContribitions: IContributionProvider<IImageRenderContribution>
  ) {
    super(imageRenderContribitions);
    this._renderContribitions = undefined;
    this.builtinContributions = [defaultGifImageRenderContribution];
    this.init(imageRenderContribitions);
  }

  drawShape(
    image: IGifImage,
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
      x: originX = imageAttribute.x,
      y: originY = imageAttribute.y,
      fillStrokeOrder = imageAttribute.fillStrokeOrder
    } = image.attribute;

    const data = this.valid(image, imageAttribute, fillCb);
    if (!data) {
      return;
    }
    const { fVisible, sVisible, doFill, doStroke } = data;

    // deal with cornerRadius
    const needRestore = true;

    const _runFill = () => {
      if (doFill) {
        if (fillCb) {
          fillCb(context, image.attribute, imageAttribute);
        } else if (fVisible) {
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

  draw(image: IGifImage, renderService: IRenderService, drawContext: IDrawContext) {
    const { context } = renderService.drawParams;
    if (!context) {
      return;
    }
    const imageAttribute = getTheme(image).image;
    this._draw(image, imageAttribute, false, drawContext);
  }
}

export class DefaultGifImageRenderContribution
  extends DefaultRectRenderContribution
  implements IImageRenderContribution
{
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
    if (image.renderFrame && image.playing) {
      image.renderFrame(context, x, y);
    }
  }
}

export const defaultGifImageRenderContribution = new DefaultGifImageRenderContribution();
