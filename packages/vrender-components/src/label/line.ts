import type { IBoundsLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import type { ILine } from '@visactor/vrender-core';
import type { PointLocationCfg } from '../core/type';
import type { LineLabelAttrs } from './type';
import { LabelBase } from './base';
import type { ComponentOptions } from '../interface';

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

  constructor(attributes: LineLabelAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, LineLabel.defaultAttributes, attributes));
  }

  protected getGraphicBounds(graphic: ILine, point: Partial<PointLocationCfg> = {}) {
    if (graphic.type !== 'line') {
      return super.getGraphicBounds(graphic, point);
    }
    const { position = 'end' } = this.attribute;
    const points = graphic?.attribute?.points || [point];
    const index = position === 'start' ? 0 : points.length - 1;
    return {
      x1: points[index].x as number,
      x2: points[index].x as number,
      y1: points[index].y as number,
      y2: points[index].y as number
    };
  }

  protected labeling(
    textBounds: IBoundsLike,
    graphicBounds: IBoundsLike,
    position: LineLabelAttrs['position'] = 'end',
    offset = 0
  ) {
    if (!textBounds || !graphicBounds) {
      return;
    }

    const { x1, x2 } = textBounds;
    const width = Math.abs(x2 - x1);

    const anchorX = graphicBounds.x1;
    const anchorY = graphicBounds.y1;

    let x = anchorX;
    const y = anchorY;

    if (position === 'end') {
      x = anchorX + width / 2 + offset;
    } else if (position === 'start') {
      x = anchorX - width / 2 - offset;
    }

    return { x, y };
  }
}
