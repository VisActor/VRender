import type { ISymbol, ISymbolGraphicAttribute } from './core';
import { Symbol as MarkSymbol, container, graphicCreator, symbolModule } from './core';
import { browser } from './isbrowser';
import { symbolCanvasPickModule, symbolMathPickModule } from './kits';

export function createSymbol(attributes: ISymbolGraphicAttribute): ISymbol {
  return new MarkSymbol(attributes);
}

export function registerSymbol() {
  graphicCreator.RegisterGraphicCreator('symbol', createSymbol);
  container.load(symbolModule);
  container.load(browser ? symbolCanvasPickModule : symbolMathPickModule);
}
