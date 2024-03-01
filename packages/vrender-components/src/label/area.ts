import type { IBoundsLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import type { IArea } from '@visactor/vrender-core';
import type { PointLocationCfg } from '../core/type';
import type { AreaLabelAttrs } from './type';
import { LabelBase } from './base';
import { labelingLineOrArea } from './util';

export class AreaLabel extends LabelBase<AreaLabelAttrs> {
  name = 'line-label';

  static defaultAttributes: Partial<AreaLabelAttrs> = {
    textStyle: {
      fill: '#000'
    },
    position: 'end',
    offset: 6
  };

  constructor(attributes: AreaLabelAttrs) {
    super(merge({}, AreaLabel.defaultAttributes, attributes));
  }

  protected getGraphicBounds(graphic: IArea, point: Partial<PointLocationCfg> = {}, position = 'end') {
    if (graphic.type !== 'area') {
      return super.getGraphicBounds(graphic, point);
    }

    const points = graphic?.attribute?.points || [point];
    const index = position === 'start' ? 0 : points.length - 1;
    return {
      x1: points[index].x as number,
      x2: points[index].x as number,
      y1: points[index].y as number,
      y2: points[index].y as number
    };
  }

  protected labeling(textBounds: IBoundsLike, graphicBounds: IBoundsLike, position: string = 'end', offset = 0) {
    return labelingLineOrArea(textBounds, graphicBounds, position, offset);
  }
}
