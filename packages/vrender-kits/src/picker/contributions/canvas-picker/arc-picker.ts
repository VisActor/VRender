import { application, ArcRender, ARC_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultCanvasArcPicker extends PickerBase implements IGraphicPicker {
  type: string = 'arc';
  numberType: number = ARC_NUMBER_TYPE;

  constructor() {
    super();
    const render = application.contributions.get<IGraphicRender>(ArcRender)[0];
    this.canvasRenderer = render;
  }
}
