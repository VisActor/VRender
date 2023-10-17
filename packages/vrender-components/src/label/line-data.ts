import type { IBoundsLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import type { LineDataLabelAttrs } from './type';
import { LabelBase } from './base';
import { labelingPoint } from './util';

export class LineDataLabel extends LabelBase<LineDataLabelAttrs> {
  name = 'line-data-label';

  static defaultAttributes: Partial<LineDataLabelAttrs> = {
    textStyle: {
      fontSize: 12,
      fill: '#000',
      textAlign: 'center',
      textBaseline: 'middle',
      boundsPadding: [-1, 0, -1, 0] // to ignore the textBound buf
    },
    position: 'top',
    offset: 5,
    pickable: false
  };

  constructor(attributes: LineDataLabelAttrs) {
    super(merge({}, LineDataLabel.defaultAttributes, attributes));
  }

  protected labeling(textBounds: IBoundsLike, graphicBounds: IBoundsLike, position = 'top', offset = 0) {
    return labelingPoint(textBounds, graphicBounds, position, offset);
  }
}
