import { contributionRegistry, RectRender } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { RectPickerBase } from '../common/rect-picker-base';

export class DefaultCanvasRectPicker extends RectPickerBase implements IGraphicPicker {
  constructor() {
    super();
    const render = contributionRegistry.get<IGraphicRender>(RectRender)[0];
    this.canvasRenderer = render;
  }
}
