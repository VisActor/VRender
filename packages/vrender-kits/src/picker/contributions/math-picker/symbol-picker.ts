import { inject, injectable, SymbolRender, SYMBOL_NUMBER_TYPE } from '@visactor/vrender-core';

import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

@injectable()
export class DefaultMathSymbolPicker extends PickerBase implements IGraphicPicker {
  type: string = 'symbol';
  numberType: number = SYMBOL_NUMBER_TYPE;

  constructor(@inject(SymbolRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
