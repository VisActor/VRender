import { registerGroup, registerLine, registerPolygon, registerSymbol, registerArc } from '@visactor/vrender-kits';

export function loadSegmentComponent() {
  registerGroup();
  registerLine();
  registerPolygon();
  registerSymbol();
}

export function loadArcSegmentComponent() {
  registerGroup();
  registerLine();
  registerArc();
  registerSymbol();
}
