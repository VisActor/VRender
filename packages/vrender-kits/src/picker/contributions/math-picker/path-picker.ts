import { inject, injectable, PathRender, PATH_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

@injectable()
export class DefaultMathPathPicker extends PickerBase implements IGraphicPicker {
  type: string = 'path';
  numberType: number = PATH_NUMBER_TYPE;

  constructor(@inject(PathRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
