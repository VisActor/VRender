import type { IBounds } from '@visactor/vutils';
import type { IContext2d, SymbolType, ISymbolClass } from '../../interface';

export function arrow2Up(ctx: IContext2d, r: number, transX: number, transY: number) {
  const r2 = r * 2;
  ctx.moveTo(transX - r2, transY + r);
  ctx.lineTo(transX, transY - r);
  ctx.lineTo(transX + r2, transY + r);

  return true;
}

// 以中心为锚点，size为circle外接正方形的面积
export class Arrow2UpSymbol implements ISymbolClass {
  type: SymbolType = 'arrow2Up';
  /* eslint-disable max-len */
  pathStr: string = 'M -0.5 0.25 L 0 -0.25 l 0.5 0.25';

  draw(ctx: IContext2d, size: number, transX: number, transY: number) {
    const r = size / 4;
    return arrow2Up(ctx, r, transX, transY);
  }

  drawOffset(ctx: IContext2d, size: number, transX: number, transY: number, offset: number) {
    const r = size / 4 + offset;
    return arrow2Up(ctx, r, transX, transY);
  }

  bounds(size: number, bounds: IBounds) {
    const r = size / 2;
    bounds.x1 = -r;
    bounds.x2 = r;
    bounds.y1 = -r;
    bounds.y2 = r;
  }
}

export default new Arrow2UpSymbol();
