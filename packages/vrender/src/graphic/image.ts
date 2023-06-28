import type { AABBBounds, OBBBounds } from '@visactor/vutils';
import type { IImage, IImageGraphicAttribute, IRepeatType } from '../interface';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY } from './graphic';
import { DefaultImageAttribute } from './config';
import { getTheme } from './theme';
import { application } from '../application';
import { parsePadding } from '../common/utils';
import { IMAGE_NUMBER_TYPE } from './constants';

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
    return this.attribute.repeatX ?? 'stretch';
  }
  set repeatX(repeatX: IRepeatType) {
    if (this.attribute.repeatX === repeatX) {
      this.attribute.repeatX = repeatX;
    }
  }
  get repeatY(): IRepeatType {
    return this.attribute.repeatY ?? 'stretch';
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

  protected doUpdateAABBBounds(): AABBBounds {
    const imageTheme = getTheme(this).image;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);
    const attribute = this.attribute;
    const bounds = application.graphicService.updateImageAABBBounds(
      attribute,
      getTheme(this).image,
      this._AABBBounds,
      this
    ) as AABBBounds;

    const { boundsPadding = imageTheme.boundsPadding } = attribute;
    const paddingArray = parsePadding(boundsPadding);
    if (paddingArray) {
      bounds.expand(paddingArray);
    }

    this.clearUpdateBoundTag();
    return bounds;
  }

  protected tryUpdateOBBBounds(): OBBBounds {
    throw new Error('暂不支持');
  }

  getDefaultAttribute(name: string) {
    return DefaultImageAttribute[name];
  }

  needUpdateTags(keys: string[]): boolean {
    for (let i = 0; i < IMAGE_UPDATE_TAG_KEY.length; i++) {
      const attrKey = IMAGE_UPDATE_TAG_KEY[i];
      if (keys.indexOf(attrKey) !== -1) {
        return true;
      }
    }
    return false;
  }
  needUpdateTag(key: string): boolean {
    for (let i = 0; i < IMAGE_UPDATE_TAG_KEY.length; i++) {
      const attrKey = IMAGE_UPDATE_TAG_KEY[i];
      if (key === attrKey) {
        return true;
      }
    }
    return false;
  }

  clone() {
    return new Image({ ...this.attribute });
  }
}
