import circle from './circle';
import cross from './cross';
import diamond from './diamond';
import square from './square';
import triangle from './triangle';
import star from './star';
import arrow from './arrow';
import wedge from './wedge';
import stroke from './stroke';
import wye from './wye';
import triangleLeft from './triangle-left';
import triangleRight from './triangle-right';
import triangleUp from './triangle-up';
import triangleDown from './triangle-down';
import thinTriangle from './thin-triangle';
import arrow2Left from './arrow2-left';
import arrow2Right from './arrow2-right';
import rect from './rect';
import { ISymbolClass } from './interface';

export const builtinSymbols = [
  circle,
  cross,
  diamond,
  square,
  thinTriangle,
  triangle,
  star,
  arrow,
  wedge,
  stroke,
  wye,
  triangleLeft,
  triangleRight,
  triangleUp,
  triangleDown,
  arrow2Left,
  arrow2Right,
  rect
];
export const builtinSymbolsMap: Record<string, ISymbolClass> = {};

builtinSymbols.forEach(symbol => {
  builtinSymbolsMap[symbol.type] = symbol;
});

export * from './utils';
export * from './interface';
