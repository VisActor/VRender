import { getTheme } from '../../../graphic/theme';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  BackgroundSizing,
  BackgroundMode,
  IImage,
  IImageGraphicAttribute,
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
import { drawBackgroundImage } from './contributions/base-contribution-render';

const repeatStr = ['', 'repeat-x', 'repeat-y', 'repeat'];

export type IImageLayoutDrawParams = Pick<
  IImageGraphicAttribute,
  'repeatX' | 'repeatY' | 'imageMode' | 'imageScale' | 'imageOffsetX' | 'imageOffsetY' | 'imagePosition'
>;

export function resolveImageRepeatMode(
  repeatX: IImageGraphicAttribute['repeatX'],
  repeatY: IImageGraphicAttribute['repeatY']
): 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' {
  let repeat = 0;
  if (repeatX === 'repeat') {
    repeat |= 0b0001;
  }
  if (repeatY === 'repeat') {
    repeat |= 0b0010;
  }
  return repeat ? (repeatStr[repeat] as 'repeat' | 'repeat-x' | 'repeat-y') : 'no-repeat';
}

export function resolveImageMode({
  repeatX = 'no-repeat',
  repeatY = 'no-repeat',
  imageMode
}: Pick<IImageLayoutDrawParams, 'repeatX' | 'repeatY' | 'imageMode'>): {
  repeatMode: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  sizingMode: BackgroundSizing;
} {
  const repeatMode = resolveImageRepeatMode(repeatX, repeatY);
  return {
    repeatMode,
    sizingMode: repeatMode === 'no-repeat' ? imageMode ?? 'fill' : 'fill'
  };
}

const IMAGE_MODE_TO_BACKGROUND_MODE: Record<BackgroundSizing, BackgroundMode> = {
  cover: 'no-repeat-cover',
  contain: 'no-repeat-contain',
  fill: 'no-repeat-fill',
  auto: 'no-repeat-auto'
};

export function resolveBackgroundParamsByImageSizing(sizingMode: BackgroundSizing): {
  backgroundMode: BackgroundMode;
  backgroundFit: boolean;
  backgroundKeepAspectRatio: boolean;
} {
  return {
    backgroundMode: IMAGE_MODE_TO_BACKGROUND_MODE[sizingMode],
    backgroundFit: false,
    backgroundKeepAspectRatio: false
  };
}

export function shouldClipImageByLayout({
  repeatX = 'no-repeat',
  repeatY = 'no-repeat',
  imageMode,
  imageScale = 1,
  imageOffsetX = 0,
  imageOffsetY = 0
}: IImageLayoutDrawParams): boolean {
  const { repeatMode, sizingMode } = resolveImageMode({
    repeatX,
    repeatY,
    imageMode
  });
  return (
    repeatMode === 'no-repeat' &&
    (sizingMode === 'cover' || sizingMode === 'auto' || imageScale !== 1 || imageOffsetX !== 0 || imageOffsetY !== 0)
  );
}

export function drawImageWithLayout(
  context: IContext2d,
  data: any,
  x: number,
  y: number,
  width: number,
  height: number,
  {
    repeatX = 'no-repeat',
    repeatY = 'no-repeat',
    imageMode,
    imageScale = 1,
    imageOffsetX = 0,
    imageOffsetY = 0,
    imagePosition = 'top-left'
  }: IImageLayoutDrawParams
) {
  const { repeatMode, sizingMode } = resolveImageMode({
    repeatX,
    repeatY,
    imageMode
  });
  const imageBackgroundParams =
    repeatMode === 'no-repeat'
      ? resolveBackgroundParamsByImageSizing(sizingMode)
      : {
          backgroundMode: repeatMode,
          backgroundFit: false,
          backgroundKeepAspectRatio: false
        };

  drawBackgroundImage(
    context,
    data,
    {
      x1: x,
      y1: y,
      x2: x + width,
      y2: y + height,
      width: () => width,
      height: () => height
    } as any,
    {
      backgroundMode: imageBackgroundParams.backgroundMode,
      backgroundFit: imageBackgroundParams.backgroundFit,
      backgroundKeepAspectRatio: imageBackgroundParams.backgroundKeepAspectRatio,
      backgroundScale: imageScale,
      backgroundOffsetX: imageOffsetX,
      backgroundOffsetY: imageOffsetY,
      backgroundPosition: imagePosition
    }
  );
}

export class DefaultCanvasImageRender extends BaseRender<IImage> implements IGraphicRender {
  type: 'image';
  numberType: number = IMAGE_NUMBER_TYPE;

  constructor(protected readonly graphicRenderContributions: IContributionProvider<IImageRenderContribution>) {
    super();
    this.builtinContributions = [defaultImageRenderContribution, defaultImageBackgroundRenderContribution];
    this.init(graphicRenderContributions);
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
      repeatX = imageAttribute.repeatX,
      repeatY = imageAttribute.repeatY,
      x: originX = imageAttribute.x,
      y: originY = imageAttribute.y,
      cornerRadius = imageAttribute.cornerRadius,
      fillStrokeOrder = imageAttribute.fillStrokeOrder,
      cornerType = imageAttribute.cornerType,
      imageMode = imageAttribute.imageMode,
      imageScale = imageAttribute.imageScale,
      imageOffsetX = imageAttribute.imageOffsetX,
      imageOffsetY = imageAttribute.imageOffsetY,
      imagePosition = imageAttribute.imagePosition,
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

    const width = image.width;
    const height = image.height;
    context.beginPath();

    // deal with cornerRadius
    let needCornerClip = false;
    if (cornerRadius === 0 || (isArray(cornerRadius) && (<number[]>cornerRadius).every(num => num === 0))) {
      // 不需要处理圆角
      context.rect(x, y, width, height);
    } else {
      // context.beginPath();
      createRectPath(context, x, y, width, height, cornerRadius, cornerType !== 'bevel');
      needCornerClip = true;
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
          drawImageWithLayout(context, res.data, x, y, width, height, {
            repeatX,
            repeatY,
            imageMode,
            imageScale,
            imageOffsetX,
            imageOffsetY,
            imagePosition
          });
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

    const needLayoutClip = shouldClipImageByLayout({
      repeatX,
      repeatY,
      imageMode,
      imageScale,
      imageOffsetX,
      imageOffsetY,
      imagePosition
    });
    const needClip = needCornerClip || needLayoutClip;

    if (!fillStrokeOrder) {
      if (needClip) {
        context.save();
        context.clip();
      }
      this.beforeRenderStep(image, context, x, y, doFill, false, fVisible, false, imageAttribute, drawContext, fillCb);
      _runFill();
      if (needClip) {
        context.restore();
      }
      _runStroke();
    } else {
      _runStroke();
      if (needClip) {
        context.save();
        context.clip();
      }
      this.beforeRenderStep(image, context, x, y, doFill, false, fVisible, false, imageAttribute, drawContext, fillCb);
      _runFill();
      if (needClip) {
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
