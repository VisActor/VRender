import type { IBoundsLike } from '@visactor/vutils';
import { isNumber } from '@visactor/vutils';

export class BaseSymbol {
  bounds(size: number | [number, number], bounds: IBoundsLike) {
    if (isNumber(size)) {
      const halfS = size / 2;
      bounds.x1 = -halfS;
      bounds.x2 = halfS;
      bounds.y1 = -halfS;
      bounds.y2 = halfS;
    } else {
      bounds.x1 = -size[0] / 2;
      bounds.x2 = size[0] / 2;
      bounds.y1 = -size[1] / 2;
      bounds.y2 = size[1] / 2;
    }
  }

  protected parseSize(size: number | [number, number]) {
    return isNumber(size) ? size : Math.min(size[0], size[1]);
  }
}
