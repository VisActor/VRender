import type { IBoundsLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import type { ILine } from '@visactor/vrender-core';
import type { PointLocationCfg } from '../core/type';
import type { LineLabelAttrs } from './type';
import { LabelBase } from './base';
import { labelingLineOrArea } from './util';

export class LineLabel extends LabelBase<LineLabelAttrs> {
  name = 'line-label';

  static defaultAttributes: Partial<LineLabelAttrs> = {
    textStyle: {
      fontSize: 12,
      fill: '#000',
      textAlign: 'center',
      textBaseline: 'middle',
      boundsPadding: [-1, 0, -1, 0] // to ignore the textBound buf
    },
    position: 'end',
    offset: 6,
    pickable: false
  };

  constructor(attributes: LineLabelAttrs) {
    super(merge({}, LineLabel.defaultAttributes, attributes));
  }

  protected getGraphicBounds(graphic: ILine, point: Partial<PointLocationCfg> = {}, position = 'end') {
    if (graphic.type !== 'line') {
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
