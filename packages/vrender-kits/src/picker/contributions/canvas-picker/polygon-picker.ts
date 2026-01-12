import { PolygonRender, POLYGON_NUMBER_TYPE, application } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { PickerBase } from '../common/base';

export class DefaultCanvasPolygonPicker extends PickerBase implements IGraphicPicker {
  type: string = 'polygon';
  numberType: number = POLYGON_NUMBER_TYPE;

  constructor() {
    super();
    try {
      this.canvasRenderer = application.services.get(PolygonRender);
    } catch (_) {
      this.canvasRenderer = application.contributions.get<IGraphicRender>(PolygonRender)[0];
    }
  }
}
