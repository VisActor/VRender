import { registerGroup, registerLine, registerPolygon, registerSymbol } from '@visactor/vrender/es/register';

export function loadSegmentComponent() {
  registerGroup();
  registerLine();
  registerPolygon();
  registerSymbol();
}
