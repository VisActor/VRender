import type { ISymbolClass } from '../../graphic';
import type { IGraphicAttribute, IGraphic } from '../graphic';

export type ISymbolAttribute = {
  symbolType: SymbolType;
  size: number | [number, number];
};

export type ISymbolGraphicAttribute = Partial<IGraphicAttribute> & Partial<ISymbolAttribute>;

export interface ISymbol extends IGraphic<ISymbolGraphicAttribute> {
  getParsedPath: () => ISymbolClass;
}

export type SymbolType =
  | 'circle'
  | 'cross'
  | 'diamond'
  | 'square'
  | 'arrow'
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
  | string;
