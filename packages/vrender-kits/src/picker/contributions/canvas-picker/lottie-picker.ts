import { inject, injectable, RectRender } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { RectPickerBase } from '../common/rect-picker-base';

@injectable()
export class DefaultCanvasLottiePicker extends RectPickerBase implements IGraphicPicker {
  constructor(@inject(RectRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
