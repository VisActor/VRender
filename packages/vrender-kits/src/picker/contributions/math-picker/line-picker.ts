import { serviceRegistry, LineRender, LINE_NUMBER_TYPE, contributionRegistry } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';
export class DefaultMathLinePicker extends PickerBase implements IGraphicPicker {
  type: string = 'line';
  numberType: number = LINE_NUMBER_TYPE;

  constructor() {
    super();
    // Acquire renderer via services (no inversify)
    try {
      this.canvasRenderer = serviceRegistry.get(LineRender) as IGraphicRender;
    } catch (_) {
      // fallback to contributions if services not registered yet
      this.canvasRenderer = contributionRegistry.get<IGraphicRender>(LineRender)[0];
    }
  }
  // numberType?: number = LINE_NUMBER_TYPE;
}
