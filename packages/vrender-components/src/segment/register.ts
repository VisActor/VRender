import { registerGroup, registerLine, registerPolygon, registerSymbol } from '@visactor/vrender-kits';

export function loadSegmentComponent() {
  registerGroup();
  registerLine();
  registerPolygon();
  registerSymbol();
}
