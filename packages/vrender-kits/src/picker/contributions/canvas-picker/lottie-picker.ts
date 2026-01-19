import { serviceRegistry, contributionRegistry, RectRender } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { RectPickerBase } from '../common/rect-picker-base';

export class DefaultCanvasLottiePicker extends RectPickerBase implements IGraphicPicker {
  constructor() {
    super();
    try {
      this.canvasRenderer = serviceRegistry.get(RectRender) as IGraphicRender;
    } catch (_) {
      this.canvasRenderer = contributionRegistry.get<IGraphicRender>(RectRender)[0];
    }
  }
}
