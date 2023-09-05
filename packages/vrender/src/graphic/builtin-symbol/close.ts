import type { IBounds } from '@visactor/vutils';
import { tau } from '@visactor/vutils';
import type { IContext2d, SymbolType, ISymbolClass, IPath2D } from '../../interface';

export function close(ctx: IContext2d, r: number, x: number, y: number, z?: number) {
  ctx.moveTo(x - r, y - r);
  ctx.lineTo(x + r, y + r);

  ctx.moveTo(x + r, y - r);
  ctx.lineTo(x - r, y + r);
  return true;
}

// 以中心为锚点，size为circle外接正方形的面积
export class CloseSymbol implements ISymbolClass {
  type: SymbolType = 'close';
  pathStr: string = 'M-0.5,-0.5L0.5,0.5,M0.5,-0.5L-0.5,0.5';

  draw(ctx: IContext2d, size: number, x: number, y: number, z?: number) {
    const r = size / 2;
    return close(ctx, r, x, y, z);
  }

  drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number, z?: number) {
    const r = size / 2 + offset;
    return close(ctx, r, x, y, z);
  }

  drawToSvgPath(size: number, x: number, y: number, z?: number): string {
    const r = size / 2;
    return `M ${x - r}, ${y - r} L ${x + r},${y + r} M ${x + r}, ${y - r} L ${x - r},${y + r}`;
  }

  bounds(size: number, bounds: IBounds) {
    const r = size / 2;
    bounds.x1 = -r;
    bounds.x2 = r;
    bounds.y1 = -r;
    bounds.y2 = r;
  }
}

export default new CloseSymbol();
