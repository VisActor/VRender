import type { IBoundsLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import type { ITextGraphicAttribute } from '@visactor/vrender';
import type { SymbolLabelAttrs } from './type';
import { LabelBase } from './base';

export class SymbolLabel extends LabelBase<SymbolLabelAttrs> {
  name = 'symbol-label';

  static defaultAttributes: Partial<SymbolLabelAttrs> = {
    textStyle: {
      fontSize: 12,
      fill: '#000',
      textAlign: 'center',
      textBaseline: 'middle',
      boundsPadding: [-1, 0, -1, 0] // to ignore the textBound buf
    },
    position: 'top',
    offset: 5,
    pickable: false
  };

  constructor(attributes: SymbolLabelAttrs) {
    super(merge({}, SymbolLabel.defaultAttributes, attributes));
  }

  protected labeling(textBounds: IBoundsLike, graphicBounds: IBoundsLike, position = 'top', offset = 0) {
    if (!textBounds) {
      return;
    }

    const { x1, y1, x2, y2 } = textBounds;
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    const anchorX = (graphicBounds.x1 + graphicBounds.x2) / 2;
    const anchorY = (graphicBounds.y1 + graphicBounds.y2) / 2;

    let sx = 0;
    let sy = 0;
    let offsetX = 0;
    let offsetY = 0;
    if (graphicBounds) {
      offsetX = Math.abs(graphicBounds.x1 - graphicBounds.x2) / 2;
      offsetY = Math.abs(graphicBounds.y1 - graphicBounds.y2) / 2;
    }

    const angle = {
      'top-right': -235,
      'top-left': 235,
      'bottom-right': 45,
      'bottom-left': -45
    };

    switch (position) {
      case 'top':
        sy = -1;
        break;
      case 'bottom':
        sy = 1;
        break;
      case 'left':
        sx = -1;
        break;
      case 'right':
        sx = 1;
        break;
      case 'bottom-left':
      case 'bottom-right':
      case 'top-left':
      case 'top-right':
        sx = Math.sin(angle[position] * (Math.PI / 180));
        sy = Math.cos(angle[position] * (Math.PI / 180));
        break;
      case 'center':
        sx = 0;
        sy = 0;
        break;
    }

    const x = anchorX + sx * (offset + offsetX) + Math.sign(sx) * (width / 2);
    const y = anchorY + sy * (offset + offsetY) + Math.sign(sy) * (height / 2);

    return { x, y };
  }
}
