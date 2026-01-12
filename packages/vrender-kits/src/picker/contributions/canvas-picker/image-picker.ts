import type { IPoint } from '@visactor/vutils';
import { IMAGE_NUMBER_TYPE, ImageRender, application } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender, IImage, IPickParams } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultCanvasImagePicker extends PickerBase implements IGraphicPicker {
  type: string = 'image';
  numberType: number = IMAGE_NUMBER_TYPE;

  constructor() {
    super();
    const render = application.contributions.get<IGraphicRender>(ImageRender)[0];
    this.canvasRenderer = render;
  }
}
