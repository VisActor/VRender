import type { IBoundsLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import type { SymbolLabelAttrs } from './type';
import { LabelBase } from './base';
import { labelingPoint } from './util';
import type { ComponentOptions } from '../interface';

export class SymbolLabel extends LabelBase<SymbolLabelAttrs> {
  name = 'symbol-label';

  static defaultAttributes: Partial<SymbolLabelAttrs> = {
    textStyle: {
      fill: '#000'
    },
    position: 'top',
    offset: 5
  };

  constructor(attributes: SymbolLabelAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, SymbolLabel.defaultAttributes, attributes));
  }

  protected labeling(textBounds: IBoundsLike, graphicBounds: IBoundsLike, position = 'top', offset = 0) {
    return labelingPoint(textBounds, graphicBounds, position, offset);
  }
}
