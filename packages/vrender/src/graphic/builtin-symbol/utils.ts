import { IBounds } from '@visactor/vutils';
import { renderCommandList } from '../../common/render-command-list';
import { IContext2d, ICustomPath2D, IGraphic } from '../../interface';
import { ISymbolClass } from './interface';

export class CustomSymbolClass implements ISymbolClass {
  type: string;
  path: ICustomPath2D;
  pathStr: string = '';

  constructor(type: string, path: ICustomPath2D) {
    this.type = type;
    this.path = path;
  }

  drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number) {
    renderCommandList(this.path.commandList, ctx, x, y, size + offset, size + offset);
    return false;
  }

  draw(ctx: IContext2d, size: number, x: number, y: number) {
    renderCommandList(this.path.commandList, ctx, x, y, size, size);
    return false;
  }

  bounds(size: number, bounds: IBounds) {
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
