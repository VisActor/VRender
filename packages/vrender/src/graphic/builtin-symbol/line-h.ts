import type { IBounds } from '@visactor/vutils';
import { tau } from '@visactor/vutils';
import type { IContext2d, SymbolType, ISymbolClass, IPath2D } from '../../interface';

export function lineH(ctx: IContext2d, r: number, x: number, y: number, z?: number) {
  ctx.moveTo(x - r, y);
  ctx.lineTo(x + r, y);
  return true;
}

// 以中心为锚点，size为circle外接正方形的面积
export class LineHSymbol implements ISymbolClass {
  type: SymbolType = 'lineH';
  pathStr: string = 'M-0.5,0L0.5,0';

  draw(ctx: IContext2d, size: number, x: number, y: number, z?: number) {
    const r = size / 2;
    return lineH(ctx, r, x, y, z);
  }

  drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number, z?: number) {
    const r = size / 2 + offset;
    return lineH(ctx, r, x, y, z);
  }

  drawToSvgPath(size: number, x: number, y: number, z?: number): string {
    const r = size / 2;
    return `M ${x - r}, ${y} L ${x + r},${y}`;
  }

  bounds(size: number, bounds: IBounds) {
    const r = size / 2;
    bounds.x1 = -r;
    bounds.x2 = r;
    bounds.y1 = -r;
    bounds.y2 = r;
  }
}

export default new LineHSymbol();
