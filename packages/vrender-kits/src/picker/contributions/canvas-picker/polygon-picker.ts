import { serviceRegistry, PolygonRender, POLYGON_NUMBER_TYPE, contributionRegistry } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultCanvasPolygonPicker extends PickerBase implements IGraphicPicker {
  type: string = 'polygon';
  numberType: number = POLYGON_NUMBER_TYPE;

  constructor() {
    super();
    try {
      this.canvasRenderer = serviceRegistry.get(PolygonRender);
    } catch (_) {
      this.canvasRenderer = contributionRegistry.get<IGraphicRender>(PolygonRender)[0];
    }
  }
}
