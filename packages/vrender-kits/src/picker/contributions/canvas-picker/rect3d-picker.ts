import { RECT3D_NUMBER_TYPE, type IRect3d, type IGraphicPicker, type IGraphicRender } from '@visactor/vrender-core';
import { Base3dPicker } from '../common/base-3d-picker';

export class DefaultCanvasRect3dPicker extends Base3dPicker<IRect3d> implements IGraphicPicker {
  type: string = 'rect3d';
  numberType: number = RECT3D_NUMBER_TYPE;
  themeType: string = 'rect';

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
