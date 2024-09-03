import type { IBoundsLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import type { PolygonLabelAttrs } from './type';
import { LabelBase } from './base';
import type { ComponentOptions } from '../interface';

export class PolygonLabel extends LabelBase<PolygonLabelAttrs> {
  name = 'polygon-label';

  static defaultAttributes: Partial<PolygonLabelAttrs> = {
    textStyle: {
      fill: '#000'
    },
    position: 'center',
    offset: 6
  };

  constructor(attributes: PolygonLabelAttrs, options?: ComponentOptions) {
    const { data, ...restAttributes } = attributes;
    super(options?.skipDefault ? attributes : { data, ...merge({}, PolygonLabel.defaultAttributes, restAttributes) });
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
