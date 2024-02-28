import type { IBoundsLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import type { LineDataLabelAttrs } from './type';
import { LabelBase } from './base';
import { labelingPoint } from './util';
import type { ComponentOptions } from '../interface';

export class LineDataLabel extends LabelBase<LineDataLabelAttrs> {
  name = 'line-data-label';

  static defaultAttributes: Partial<LineDataLabelAttrs> = {
    textStyle: {
      fill: '#000'
    },
    position: 'top',
    offset: 5
  };

  constructor(attributes: LineDataLabelAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, LineDataLabel.defaultAttributes, attributes));
  }

  protected labeling(textBounds: IBoundsLike, graphicBounds: IBoundsLike, position = 'top', offset = 0) {
    return labelingPoint(textBounds, graphicBounds, position, offset);
  }
}
