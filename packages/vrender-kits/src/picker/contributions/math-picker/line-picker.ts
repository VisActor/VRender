import { inject, injectable, LineRender, LINE_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';
@injectable()
export class DefaultMathLinePicker extends PickerBase implements IGraphicPicker {
  type: string = 'line';
  numberType: number = LINE_NUMBER_TYPE;

  constructor(@inject(LineRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
  // numberType?: number = LINE_NUMBER_TYPE;
}
