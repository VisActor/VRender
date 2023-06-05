import { IBounds } from '@visactor/vutils';
import { SymbolType, ICustomPath2D, IPath2D } from '../../interface';

export interface ISymbolClass {
  type: SymbolType | string;
  path?: ICustomPath2D;
  pathStr: string;

  // 返回true表示内部已经调用closePath，返回false表示没有调用closePath，外部需要调用closePath
  draw: (ctx: IPath2D, size: number | [number, number], x: number, y: number, z?: number) => boolean;
  drawOffset: (
    ctx: IPath2D,
    size: number | [number, number],
    x: number,
    y: number,
    offset: number,
    z?: number
  ) => boolean;

  bounds: (size: number | [number, number], bounds: IBounds) => void;
}
