import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { RectPickerBase } from '../common/rect-picker-base';

export class DefaultCanvasRectPicker extends RectPickerBase implements IGraphicPicker {
  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
