import type { IBoundsLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import type { RectLabelAttrs } from './type';
import { LabelBase } from './base';
import type { ComponentOptions } from '../interface';

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
    super(options?.skipDefault ? attributes : merge({}, RectLabel.defaultAttributes, attributes));
  }

  protected labeling(textBounds: IBoundsLike, graphicBounds: IBoundsLike, position = 'top', offset = 0) {
    if (!textBounds || !graphicBounds) {
      return;
    }

    const { x1, y1, x2, y2 } = textBounds;
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    const rectWidth = Math.abs(graphicBounds.x2 - graphicBounds.x1);
    const rectHeight = Math.abs(graphicBounds.y2 - graphicBounds.y1);
    let anchorX = (graphicBounds.x1 + graphicBounds.x2) / 2;
    let anchorY = (graphicBounds.y1 + graphicBounds.y2) / 2;

    let sx = 0;
    let sy = 0;

    switch (position) {
      case 'top':
      case 'inside-top':
        sy = -0.5;
        break;
      case 'bottom':
      case 'inside-bottom':
        sy = 0.5;
        break;
      case 'left':
      case 'inside-left':
        sx = -0.5;
        break;
      case 'right':
      case 'inside-right':
        sx = 0.5;
        break;
      case 'top-right':
        sx = 0.5;
        sy = -0.5;
        break;
      case 'top-left':
        sx = -0.5;
        sy = -0.5;
        break;
      case 'bottom-right':
        sx = 0.5;
        sy = 0.5;
        break;
      case 'bottom-left':
        sx = -0.5;
        sy = 0.5;
    }

    anchorX += sx * rectWidth;
    anchorY += sy * rectHeight;

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
