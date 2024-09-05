import type { IAABBBounds } from '@visactor/vutils';
import type { IImage, IImageGraphicAttribute, IRepeatType, ISetAttributeContext } from '../interface';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import { DefaultImageAttribute } from './config';
import { getTheme } from './theme';
import { application } from '../application';
import { IMAGE_NUMBER_TYPE } from './constants';
import { updateBoundsOfCommonOuterBorder } from './graphic-service/common-outer-boder-bounds';

const IMAGE_UPDATE_TAG_KEY = ['width', 'height', 'image', ...GRAPHIC_UPDATE_TAG_KEY];

/**
 * TODO image 需要考虑加载问题 等load模块
 * 同时需要在Graphic增加 图片填充 or 图片按形状clip功能
 */
export class Image extends Graphic<IImageGraphicAttribute> implements IImage {
  type: 'image' = 'image';
  // 资源加载完成后回调，外部通过回调获取图片资源尺寸
  successCallback?: () => void;
  failCallback?: () => void;

  static NOWORK_ANIMATE_ATTR = {
    image: 1,
    repeatX: 1,
    repeatY: 1,
    ...NOWORK_ANIMATE_ATTR
  };

  constructor(params: IImageGraphicAttribute) {
    super(params);
    this.numberType = IMAGE_NUMBER_TYPE;

    this.loadImage(this.attribute.image);
  }

  get width(): number {
    return this.attribute.width ?? 0;
  }
  set width(width: number) {
    if (this.attribute.width === width) {
      this.attribute.width = width;
      this.addUpdateShapeAndBoundsTag();
    }
  }

  get height(): number {
    return this.attribute.height ?? 0;
  }
  set height(height: number) {
    if (this.attribute.height === height) {
      this.attribute.height = height;
      this.addUpdateShapeAndBoundsTag();
    }
  }
  get repeatX(): IRepeatType {
    return this.attribute.repeatX ?? 'no-repeat';
  }
  set repeatX(repeatX: IRepeatType) {
    if (this.attribute.repeatX === repeatX) {
      this.attribute.repeatX = repeatX;
    }
  }
  get repeatY(): IRepeatType {
    return this.attribute.repeatY ?? 'no-repeat';
  }
  set repeatY(repeatY: IRepeatType) {
    if (this.attribute.repeatY === repeatY) {
      this.attribute.repeatY = repeatY;
    }
  }
  get image(): string | HTMLImageElement | HTMLCanvasElement {
    return this.attribute.image;
  }
  set image(image: string | HTMLImageElement | HTMLCanvasElement) {
    if (image !== this.attribute.image) {
      this.attribute.image = image;
      this.loadImage(this.attribute.image);
      // this.addUpdateShapeAndBoundsTag();
    }
  }

  imageLoadSuccess(url: string, image: HTMLImageElement, cb?: () => void): void {
    super.imageLoadSuccess(url, image, () => {
      if (this.successCallback) {
        this.successCallback();
      }
    });
  }

  imageLoadFail(url: string, cb?: () => void): void {
    super.imageLoadFail(url, () => {
      if (this.failCallback) {
        this.failCallback();
      }
    });
  }

  setAttributes(
    params: Partial<IImageGraphicAttribute>,
    forceUpdateTag?: boolean,
    context?: ISetAttributeContext
  ): void {
    if (params.image) {
      this.loadImage(params.image);
    }
    return super.setAttributes(params, forceUpdateTag, context);
  }

  setAttribute(key: string, value: any, forceUpdateTag?: boolean, context?: ISetAttributeContext): void {
    if (key === 'image') {
      this.loadImage(value);
    }
    return super.setAttribute(key, value, forceUpdateTag, context);
  }

  getGraphicTheme(): Required<IImageGraphicAttribute> {
    return getTheme(this).image;
  }

  protected updateAABBBounds(
    attribute: IImageGraphicAttribute,
    imageTheme: Required<IImageGraphicAttribute>,
    aabbBounds: IAABBBounds
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds)) {
      const { width = imageTheme.width, height = imageTheme.height } = attribute;
      aabbBounds.set(0, 0, width, height);
    }

    const { tb1, tb2 } = application.graphicService.updateTempAABBBounds(aabbBounds);

    updateBoundsOfCommonOuterBorder(attribute, imageTheme, tb1);
    aabbBounds.union(tb1);
    tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);

    application.graphicService.transformAABBBounds(attribute, aabbBounds, imageTheme, false, this);
    return aabbBounds;
  }

  getDefaultAttribute(name: string) {
    return (DefaultImageAttribute as any)[name];
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, IMAGE_UPDATE_TAG_KEY);
  }
  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, IMAGE_UPDATE_TAG_KEY);
  }

  clone() {
    return new Image({ ...this.attribute });
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Image.NOWORK_ANIMATE_ATTR;
  }
}

export function createImage(attributes: IImageGraphicAttribute): IImage {
  return new Image(attributes);
}
