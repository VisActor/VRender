import type {
  IContext2d,
  IContributionProvider,
  IDrawContext,
  IGraphicAttribute,
  IGraphicRender,
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
