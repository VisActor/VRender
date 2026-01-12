import type { IPoint } from '@visactor/vutils';
import type { IGraphicPicker, IPickParams } from '@visactor/vrender-core';
import type { IGifImage } from '../../../interface/gif-image';
import { GIFIMAGE_NUMBER_TYPE } from '../../../graphic/constants';

export class DefaultCanvasGifImagePicker implements IGraphicPicker {
  type: string = 'gif-image';
  numberType: number = GIFIMAGE_NUMBER_TYPE;

  contains(gifImage: IGifImage, point: IPoint, params?: IPickParams): boolean {
    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    if (!gifImage.AABBBounds.containsPoint(point)) {
      return false;
    }

    // TODO: 详细形状判断
    return true;
  }
}
