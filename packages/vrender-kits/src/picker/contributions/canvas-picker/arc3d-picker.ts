import { ARC3D_NUMBER_TYPE, type IArc3d, type IGraphicPicker, type IGraphicRender } from '@visactor/vrender-core';
import { Base3dPicker } from '../common/base-3d-picker';

export class DefaultCanvasArc3dPicker extends Base3dPicker<IArc3d> implements IGraphicPicker {
  type: string = 'arc3d';
  numberType: number = ARC3D_NUMBER_TYPE;
  themeType: string = 'arc';

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
