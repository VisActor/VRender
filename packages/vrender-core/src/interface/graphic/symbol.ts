import type { IBounds } from '@visactor/vutils';
import type { IGraphicAttribute, IGraphic } from '../graphic';
import type { ICustomPath2D, IPath2D } from '../path';

export type ISymbolAttribute = {
  symbolType: SymbolType;
  size: number | [number, number];
  clipRange: number;
};

export type ISymbolGraphicAttribute = Partial<IGraphicAttribute> & Partial<ISymbolAttribute>;

export interface ISymbol extends IGraphic<ISymbolGraphicAttribute> {
  getParsedPath: () => ISymbolClass;
  getParsedPath2D: (x?: number, y?: number, size?: number) => Path2D | null;
}

export type SymbolType =
  | 'circle'
  | 'cross'
  | 'diamond'
  | 'square'
  | 'arrow'
  | 'arrowLeft'
  | 'arrowRight'
  | 'arrow2Left'
  | 'arrow2Right'
  | 'wedge'
  | 'thinTriangle'
  | 'triangle'
  | 'triangleUp'
  | 'triangleDown'
  | 'triangleRight'
  | 'triangleLeft'
  | 'stroke'
  | 'star'
  | 'wye'
  | 'rect'
  | 'rectRound'
  | 'roundLine'
  | string;

export interface ISymbolClass {
  type: SymbolType | string;
  path?: ICustomPath2D;
  pathStr: string;
  isSvg?: boolean;

  // 返回true表示内部已经调用closePath，返回false表示没有调用closePath，外部需要调用closePath
  draw: (
    ctx: IPath2D,
    size: number | [number, number],
    x: number,
    y: number,
    z?: number,
    cb?: (p: ICustomPath2D, a: any) => void
  ) => boolean;
  drawWithClipRange?: (
    ctx: IPath2D,
    size: number | [number, number],
    x: number,
    y: number,
    clipRange: number,
    z?: number,
    cb?: (p: ICustomPath2D, a: any) => void
  ) => boolean;
  drawOffset: (
    ctx: IPath2D,
    size: number | [number, number],
    x: number,
    y: number,
    offset: number,
    z?: number,
    cb?: (p: ICustomPath2D, a: any) => void
  ) => boolean;

  drawToSvgPath?: (size: number | [number, number], x: number, y: number, z?: number) => string;

  bounds: (size: number | [number, number], bounds: IBounds) => void;
}
