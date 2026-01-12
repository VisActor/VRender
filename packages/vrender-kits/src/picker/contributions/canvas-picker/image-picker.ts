import type { IPoint } from '@visactor/vutils';
import { contributionRegistry, IMAGE_NUMBER_TYPE, ImageRender } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultCanvasImagePicker extends PickerBase implements IGraphicPicker {
  type: string = 'image';
  numberType: number = IMAGE_NUMBER_TYPE;

  constructor() {
    super();
    const render = contributionRegistry.get<IGraphicRender>(ImageRender)[0];
    this.canvasRenderer = render;
  }
}
