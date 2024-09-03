import type { IBoundsLike, IPointLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import type { ILine } from '@visactor/vrender-core';
import type { PointLocationCfg } from '../core/type';
import type { LineLabelAttrs } from './type';
import { LabelBase } from './base';
import { labelingLineOrArea } from './util';
import type { ComponentOptions } from '../interface';
import { registerLabelComponent } from './data-label-register';
import type { ISegment } from '@visactor/vrender-core';

export class LineLabel extends LabelBase<LineLabelAttrs> {
  name = 'line-label';

  static defaultAttributes: Partial<LineLabelAttrs> = {
    textStyle: {
      fill: '#000'
    },
    position: 'end',
    offset: 6
  };

  constructor(attributes: LineLabelAttrs, options?: ComponentOptions) {
    const { data, ...restAttributes } = attributes;
    super(options?.skipDefault ? attributes : { data, ...merge({}, LineLabel.defaultAttributes, restAttributes) });
  }

  protected getGraphicBounds(graphic: ILine, point: Partial<PointLocationCfg> = {}, position = 'end') {
    if (!graphic || (graphic.type !== 'line' && graphic.type !== 'area')) {
      return super.getGraphicBounds(graphic, point);
    }

    let points = graphic.attribute.points;
    const segments = graphic.attribute.segments;

    if (!points && segments && segments.length) {
      points = segments.reduce((res: IPointLike[], seg: ISegment) => {
        return res.concat(seg.points ?? []);
      }, []);
    }

    if (!points || points.length === 0) {
      points = [point as IPointLike];
    }

    const index = position === 'start' ? 0 : points.length - 1;
    if (!points[index]) {
      return;
    }
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

export const registerLineDataLabel = () => {
  registerLabelComponent('line', LineLabel);
  registerLabelComponent('area', LineLabel);
};
