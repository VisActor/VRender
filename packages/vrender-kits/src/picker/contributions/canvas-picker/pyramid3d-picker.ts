import { inject, injectable, Pyramid3dRender, PYRAMID3D_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IPyramid3d, IGraphicRender, IGraphicPicker } from '@visactor/vrender-core';
import { Base3dPicker } from '../common/base-3d-picker';

@injectable()
export class DefaultCanvasPyramid3dPicker extends Base3dPicker<IPyramid3d> implements IGraphicPicker {
  type: string = 'pyramid3d';
  numberType: number = PYRAMID3D_NUMBER_TYPE;

  themeType: string = 'polygon';

  constructor(@inject(Pyramid3dRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
