import { application, Pyramid3dRender, PYRAMID3D_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IPyramid3d, IGraphicRender, IGraphicPicker } from '@visactor/vrender-core';
import { Base3dPicker } from '../common/base-3d-picker';

export class DefaultCanvasPyramid3dPicker extends Base3dPicker<IPyramid3d> implements IGraphicPicker {
  type: string = 'pyramid3d';
  numberType: number = PYRAMID3D_NUMBER_TYPE;

  themeType: string = 'polygon';

  constructor() {
    super();
    try {
      this.canvasRenderer = application.services.get(Pyramid3dRender) as IGraphicRender;
    } catch (_) {
      this.canvasRenderer = application.contributions.get<IGraphicRender>(Pyramid3dRender)[0];
    }
  }
}
