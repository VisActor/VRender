import type { IPoint } from '@visactor/vutils';
import { injectable, IMAGE_NUMBER_TYPE, inject, ImageRender } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender, IImage, IPickParams } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

@injectable()
export class DefaultCanvasImagePicker extends PickerBase implements IGraphicPicker {
  type: string = 'image';
  numberType: number = IMAGE_NUMBER_TYPE;

  constructor(@inject(ImageRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
