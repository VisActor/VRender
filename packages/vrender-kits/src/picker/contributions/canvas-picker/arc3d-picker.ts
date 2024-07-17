import { inject, injectable, Arc3dRender, ARC3D_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IArc3d, IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { BasePicker } from './base-picker';

@injectable()
export class DefaultCanvasArc3dPicker extends BasePicker<IArc3d> implements IGraphicPicker {
  type: string = 'arc3d';
  numberType: number = ARC3D_NUMBER_TYPE;
  themeType: string = 'arc';

  constructor(@inject(Arc3dRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
