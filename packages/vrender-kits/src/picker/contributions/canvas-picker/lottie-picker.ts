import { application, RectRender } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { RectPickerBase } from '../common/rect-picker-base';

export class DefaultCanvasLottiePicker extends RectPickerBase implements IGraphicPicker {
  constructor() {
    super();
    try {
      this.canvasRenderer = application.services.get(RectRender) as IGraphicRender;
    } catch (_) {
      this.canvasRenderer = application.contributions.get<IGraphicRender>(RectRender)[0];
    }
  }
}
