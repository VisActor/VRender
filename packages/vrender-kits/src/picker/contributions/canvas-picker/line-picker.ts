import { inject, injectable, LineRender, LINE_NUMBER_TYPE } from '@visactor/vrender-core';
import type { ILine, IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { BaseLinePicker } from '../common/base-line-picker';

@injectable()
export class DefaultCanvasLinePicker extends BaseLinePicker<ILine> implements IGraphicPicker {
  type: string = 'line';
  numberType: number = LINE_NUMBER_TYPE;

  constructor(@inject(LineRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
