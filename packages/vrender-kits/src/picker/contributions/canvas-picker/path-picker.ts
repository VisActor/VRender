import { PATH_NUMBER_TYPE, type IPath, type IGraphicRender, type IGraphicPicker } from '@visactor/vrender-core';
import { BaseLinePicker } from '../common/base-line-picker';

export class DefaultCanvasPathPicker extends BaseLinePicker<IPath> implements IGraphicPicker {
  type: string = 'path';
  numberType: number = PATH_NUMBER_TYPE;

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
