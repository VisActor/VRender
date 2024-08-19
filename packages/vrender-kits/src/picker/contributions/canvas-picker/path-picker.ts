import { inject, injectable, PathRender, PATH_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IPath, IGraphicRender, IGraphicPicker } from '@visactor/vrender-core';
import { BaseLinePicker } from '../common/base-line-picker';

@injectable()
export class DefaultCanvasPathPicker extends BaseLinePicker<IPath> implements IGraphicPicker {
  type: string = 'path';
  numberType: number = PATH_NUMBER_TYPE;

  constructor(@inject(PathRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
