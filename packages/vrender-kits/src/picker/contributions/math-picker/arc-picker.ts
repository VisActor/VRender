import { serviceRegistry, contributionRegistry, ArcRender, ARC_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultMathArcPicker extends PickerBase implements IGraphicPicker {
  type: string = 'arc';
  numberType: number = ARC_NUMBER_TYPE;

  constructor() {
    super();
    try {
      this.canvasRenderer = serviceRegistry.get(ArcRender) as IGraphicRender;
    } catch (_) {
      this.canvasRenderer = contributionRegistry.get<IGraphicRender>(ArcRender)[0];
    }
  }
}
