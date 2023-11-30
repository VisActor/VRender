import type { IBoundsLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import type { PolygonLabelAttrs } from './type';
import { LabelBase } from './base';
import type { ComponentOptions } from '../interface';

export class PolygonLabel extends LabelBase<PolygonLabelAttrs> {
  name = 'polygon-label';

  static defaultAttributes: Partial<PolygonLabelAttrs> = {
    textStyle: {
      fontSize: 12,
      fill: '#000',
      textAlign: 'center',
      textBaseline: 'middle',
      boundsPadding: [-1, 0, -1, 0] // to ignore the textBound buf
    },
    position: 'center',
    offset: 6,
    pickable: false
  };

  constructor(attributes: PolygonLabelAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, PolygonLabel.defaultAttributes, attributes));
  }

  protected labeling(
    textBounds: IBoundsLike,
    graphicBounds: IBoundsLike,
    position: PolygonLabelAttrs['position'] = 'center',
    offset = 0
  ) {
    if (!textBounds || !graphicBounds) {
      return;
    }

    const { x1, x2, y2, y1 } = textBounds;

    const x = (x1 + x2) / 2;
    const y = (y1 + y2) / 2;

    return { x, y };
  }
}
