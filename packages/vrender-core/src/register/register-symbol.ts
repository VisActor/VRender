import { createSymbol } from '../graphic/symbol';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerSymbolGraphic() {
  registerGraphic('symbol', createSymbol);
}
