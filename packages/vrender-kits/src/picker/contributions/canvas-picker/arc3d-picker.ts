import { application, Arc3dRender, ARC3D_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IArc3d, IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { Base3dPicker } from '../common/base-3d-picker';

export class DefaultCanvasArc3dPicker extends Base3dPicker<IArc3d> implements IGraphicPicker {
  type: string = 'arc3d';
  numberType: number = ARC3D_NUMBER_TYPE;
  themeType: string = 'arc';

  constructor() {
    super();
    try {
      this.canvasRenderer = application.services.get(Arc3dRender) as IGraphicRender;
    } catch (_) {
      this.canvasRenderer = application.contributions.get<IGraphicRender>(Arc3dRender)[0];
    }
  }
}
