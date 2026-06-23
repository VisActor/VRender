import { registerArc } from '@visactor/vrender-kits/register/register-arc';
import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerLine } from '@visactor/vrender-kits/register/register-line';
import { registerPolygon } from '@visactor/vrender-kits/register/register-polygon';
import { registerSymbol } from '@visactor/vrender-kits/register/register-symbol';

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
