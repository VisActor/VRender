import { application, Rect3DRender, RECT3D_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IRect3d, IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { Base3dPicker } from '../common/base-3d-picker';

export class DefaultCanvasRect3dPicker extends Base3dPicker<IRect3d> implements IGraphicPicker {
  type: string = 'rect3d';
  numberType: number = RECT3D_NUMBER_TYPE;
  themeType: string = 'rect';

  constructor() {
    super();
    try {
      this.canvasRenderer = application.services.get(Rect3DRender) as IGraphicRender;
    } catch (_) {
      this.canvasRenderer = application.contributions.get<IGraphicRender>(Rect3DRender)[0];
    }
  }
}
