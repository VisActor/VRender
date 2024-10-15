import type { IBoundsLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import type { SymbolLabelAttrs } from './type';
import { LabelBase } from './base';
import { labelingPoint } from './util';
import type { ComponentOptions } from '../interface';
import { registerLabelComponent } from './data-label-register';

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
    const { data, ...restAttributes } = attributes;
    super(options?.skipDefault ? attributes : { data, ...merge({}, SymbolLabel.defaultAttributes, restAttributes) });
  }

  protected labeling(textBounds: IBoundsLike, graphicBounds: IBoundsLike, position = 'top', offset = 0) {
    return labelingPoint(textBounds, graphicBounds, position, offset);
  }
}

export const registerSymbolDataLabel = () => {
  registerLabelComponent('symbol', SymbolLabel);
  registerLabelComponent('line-data', SymbolLabel);
};
