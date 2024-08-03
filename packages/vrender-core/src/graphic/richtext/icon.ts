import type { IAABBBounds } from '@visactor/vutils';
import { isArray } from '@visactor/vutils';
import type { ICustomPath2D, IRichTextIcon, IRichTextIconGraphicAttribute } from '../../interface';
import { Image } from '../image';
import { DefaultImageAttribute } from '../config';
import { parsePadding } from '../../common/utils';

// export const IMAGE_NUMBER_TYPE = genNumberType();

export class RichTextIcon extends Image implements IRichTextIcon {
  // type: 'richtext-icon' = 'richtext-icon';
  declare attribute: IRichTextIconGraphicAttribute;
  richtextId?: string;
  // 全局坐标，供外部用户pick后使用
  globalX?: number;
  globalY?: number;
  _x: number = 0;
  _y: number = 0;
  _hovered: boolean = false;
  _marginArray: [number, number, number, number] = [0, 0, 0, 0];

  constructor(params: IRichTextIconGraphicAttribute) {
    super(params);

    if (params.backgroundShowMode === 'always') {
      this._hovered = true;
    }

    if (params.margin) {
      const marginArray = parsePadding(params.margin);
      if (typeof marginArray === 'number') {
        this._marginArray = [marginArray, marginArray, marginArray, marginArray];
      } else {
        this._marginArray = marginArray;
      }
    }

    this.onBeforeAttributeUpdate = (val: any, attributes: any, key: null | string | string[]) => {
      if ((isArray(key) && key.indexOf('margin') !== -1) || key === 'margin') {
        if (attributes.margin) {
          const marginArray = parsePadding(attributes.margin);
          if (typeof marginArray === 'number') {
            this._marginArray = [marginArray, marginArray, marginArray, marginArray];
          } else {
            this._marginArray = marginArray;
          }
        } else {
          this._marginArray = [0, 0, 0, 0];
        }
      }
      return undefined;
    };
  }
  animationBackUps?: { from: Record<string, any>; to: Record<string, any> } | undefined;
  incrementalAt?: number | undefined;
  toCustomPath?: (() => ICustomPath2D) | undefined;

  get width(): number {
    return (this.attribute.width ?? 0) + this._marginArray[1] + this._marginArray[3];
  }

  get height(): number {
    return (this.attribute.height ?? 0) + this._marginArray[0] + this._marginArray[2];
  }

  protected tryUpdateAABBBounds(): IAABBBounds {
    if (!this.shouldUpdateAABBBounds()) {
      return this._AABBBounds;
    }

    this.doUpdateAABBBounds();

    // 扩大范围
    const { width = DefaultImageAttribute.width, height = DefaultImageAttribute.height } = this.attribute;
    const { backgroundWidth = width, backgroundHeight = height } = this.attribute;
    const expandX = (backgroundWidth - width) / 2;
    const expandY = (backgroundHeight - height) / 2;
    (this._AABBBounds as any).expand([0, expandX * 2, expandY * 2, 0]);

    return this._AABBBounds;
  }

  setHoverState(hovered: boolean) {
    if (this.attribute.backgroundShowMode === 'hover' && this._hovered !== hovered) {
      this._hovered = hovered;
    }
  }
}
