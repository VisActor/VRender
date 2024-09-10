import type { IBoundsLike } from '@visactor/vutils';
import { calculateAnchorOfBounds, merge } from '@visactor/vutils';
import type { RectLabelAttrs } from './type';
import { LabelBase } from './base';
import type { ComponentOptions } from '../interface';
import { registerLabelComponent } from './data-label-register';

export class RectLabel extends LabelBase<RectLabelAttrs> {
  static tag = 'rect-label';

  static defaultAttributes: Partial<RectLabelAttrs> = {
    textStyle: {
      fill: '#000'
    },
    position: 'top',
    offset: 5
  };

  constructor(attributes: RectLabelAttrs, options?: ComponentOptions) {
    const { data, ...restAttributes } = attributes;
    super(options?.skipDefault ? attributes : { data, ...merge({}, RectLabel.defaultAttributes, restAttributes) });
  }

  protected labeling(textBounds: IBoundsLike, graphicBounds: IBoundsLike, position = 'top', offset = 0) {
    if (!textBounds || !graphicBounds) {
      return;
    }

    const { x1, y1, x2, y2 } = textBounds;
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    const { x: anchorX, y: anchorY } = calculateAnchorOfBounds(graphicBounds, position);

    let vx = 0;
    let vy = 0;

    const isInside = position.includes('inside');

    if (position.includes('top')) {
      vy = isInside ? 1 : -1;
    } else if (position.includes('bottom')) {
      vy = isInside ? -1 : 1;
    } else if (position.includes('left')) {
      vx = isInside ? 1 : -1;
    } else if (position.includes('right')) {
      vx = isInside ? -1 : 1;
    }

    switch (position) {
      case 'top-right':
      case 'bottom-right':
        vx = -1;
        break;
      case 'top-left':
      case 'bottom-left':
        vx = 1;
        break;
      default:
        break;
    }

    const x = anchorX + vx * offset + (vx * width) / 2;
    const y = anchorY + vy * offset + (vy * height) / 2;

    return { x, y };
  }
}

export const registerRectDataLabel = () => {
  registerLabelComponent('rect', RectLabel);
};
