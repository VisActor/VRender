import type { IPoint } from '@visactor/vutils';
import { IMAGE_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IImage, IPickParams } from '@visactor/vrender-core';

export class DefaultMathImagePicker implements IGraphicPicker {
  type: string = 'image';
  numberType: number = IMAGE_NUMBER_TYPE;

  contains(image: IImage, point: IPoint, params?: IPickParams): boolean {
    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    if (!image.AABBBounds.containsPoint(point)) {
      return false;
    }

    // TODO: 详细形状判断
    return true;
  }
}
