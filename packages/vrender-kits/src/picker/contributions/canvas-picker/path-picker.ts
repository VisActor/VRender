import { application, PathRender, PATH_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IPath, IGraphicRender, IGraphicPicker } from '@visactor/vrender-core';
import { BaseLinePicker } from '../common/base-line-picker';

export class DefaultCanvasPathPicker extends BaseLinePicker<IPath> implements IGraphicPicker {
  type: string = 'path';
  numberType: number = PATH_NUMBER_TYPE;

  constructor() {
    super();
    const render = application.contributions.get<IGraphicRender>(PathRender)[0];
    this.canvasRenderer = render;
  }
}
