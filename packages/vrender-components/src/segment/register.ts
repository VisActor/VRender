import { registerGroup, registerLine, registerPolygon, registerSymbol, registerArc } from '@visactor/vrender-kits';

export function loadSegmentComponent(enableAnimation: boolean = false) {
  registerGroup();
  registerLine();
  registerPolygon();
  registerSymbol();
}

export function loadArcSegmentComponent(enableAnimation: boolean = false) {
  registerGroup();
  registerLine();
  registerArc();
  registerSymbol();
}
