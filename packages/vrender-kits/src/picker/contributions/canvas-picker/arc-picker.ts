import { inject, injectable, ArcRender } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { ArcPickerBase } from '../common/arc-picker-base';

@injectable()
export class DefaultCanvasArcPicker extends ArcPickerBase implements IGraphicPicker {
  constructor(@inject(ArcRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
