import { application, ArcRender, ARC_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultMathArcPicker extends PickerBase implements IGraphicPicker {
  type: string = 'arc';
  numberType: number = ARC_NUMBER_TYPE;

  constructor() {
    super();
    try {
      this.canvasRenderer = application.services.get(ArcRender) as IGraphicRender;
    } catch (_) {
      this.canvasRenderer = application.contributions.get<IGraphicRender>(ArcRender)[0];
    }
  }
}
