import { registerGroup, registerLine, registerPolygon, registerSymbol } from '@visactor/vrender/es/register';

export function loadSegment() {
  registerGroup();
  registerLine();
  registerPolygon();
  registerSymbol();
}
