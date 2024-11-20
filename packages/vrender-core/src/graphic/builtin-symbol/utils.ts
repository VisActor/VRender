import { isArray, type IBounds, AABBBounds, isNumber } from '@visactor/vutils';
import { renderCommandList } from '../../common/render-command-list';
import type { IContext2d, ICustomPath2D, IGraphicAttribute, ISymbolClass } from '../../interface';

const tempBounds = new AABBBounds();
export class CustomSymbolClass implements ISymbolClass {
  type: string;
  path: ICustomPath2D;
  pathStr: string = '';
  isSvg: boolean;
  svgCache?: { path: ICustomPath2D; attribute: Partial<IGraphicAttribute> }[];

  constructor(
    type: string,
    path: ICustomPath2D | { path: ICustomPath2D; attribute: Partial<IGraphicAttribute> }[],
    isSvg: boolean = false
  ) {
    this.type = type;
    if (isArray(path)) {
      this.svgCache = path;
    } else {
      this.path = path;
    }
    this.isSvg = isSvg;
  }

  drawOffset(
    ctx: IContext2d,
    size: number,
    x: number,
    y: number,
    offset: number,
    z?: number,
    cb?: (path: ICustomPath2D, attribute?: Record<string, any>) => void
  ) {
    size = this.parseSize(size);
    if (this.isSvg) {
      if (!this.svgCache) {
        return false;
      }
      this.svgCache.forEach(item => {
        ctx.beginPath();
        renderCommandList(item.path.commandList, ctx, x, y, size, size);
        cb && cb(item.path, item.attribute);
      });
      return false;
    }
    renderCommandList(this.path.commandList, ctx, x, y, size + offset, size + offset);
    return false;
  }

  draw(
    ctx: IContext2d,
    size: number,
    x: number,
    y: number,
    z?: number,
    cb?: (path: ICustomPath2D, attribute?: Record<string, any>) => void
  ) {
    size = this.parseSize(size);
    return this.drawOffset(ctx, size, x, y, 0, z, cb);
  }

  protected parseSize(size: number | [number, number]): number {
    return isNumber(size) ? size : Math.min(size[0], size[1]);
  }

  bounds(size: number, bounds: IBounds) {
    size = this.parseSize(size);
    if (this.isSvg) {
      if (!this.svgCache) {
        return;
      }
      bounds.clear();
      this.svgCache.forEach(({ path }) => {
        tempBounds.x1 = path.bounds.x1 * size;
        tempBounds.y1 = path.bounds.y1 * size;
        tempBounds.x2 = path.bounds.x2 * size;
        tempBounds.y2 = path.bounds.y2 * size;
        bounds.union(tempBounds);
      });
      return;
    }
    if (!this.path.bounds) {
      return;
    }
    bounds.x1 = this.path.bounds.x1 * size;
    bounds.y1 = this.path.bounds.y1 * size;
    bounds.x2 = this.path.bounds.x2 * size;
    bounds.y2 = this.path.bounds.y2 * size;
  }
}

// export function CustomSymbol(): ISymbolClass {

// }
