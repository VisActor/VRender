import type { IBounds } from '@visactor/vutils';
import { tau } from '@visactor/vutils';
import type { IContext2d, SymbolType, ISymbolClass, IPath2D } from '../../interface';
import { BaseSymbol } from './base';

export function lineV(ctx: IContext2d, r: number, x: number, y: number, z?: number) {
  ctx.moveTo(x, y - r);
  ctx.lineTo(x, y + r);
  return true;
}

// 以中心为锚点，size为circle外接正方形的面积
export class LineVSymbol extends BaseSymbol implements ISymbolClass {
  type: SymbolType = 'lineV';
  pathStr: string = 'M0,-0.5L0,0.5';

  draw(ctx: IContext2d, size: number, x: number, y: number, z?: number) {
    const r = this.parseSize(size) / 2;
    return lineV(ctx, r, x, y, z);
  }

  drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number, z?: number) {
    const r = this.parseSize(size) / 2 + offset;
    return lineV(ctx, r, x, y, z);
  }

  drawToSvgPath(size: number, x: number, y: number, z?: number): string {
    const r = this.parseSize(size) / 2;
    return `M ${x}, ${y - r} L ${x},${y + r}`;
  }
}

export default new LineVSymbol();
