import { inject, injectable, AreaRender, AREA_NUMBER_TYPE } from '@visactor/vrender-core';

import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

@injectable()
export class DefaultMathAreaPicker extends PickerBase implements IGraphicPicker {
  type: string = 'area';
  numberType: number = AREA_NUMBER_TYPE;

  constructor(@inject(AreaRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
