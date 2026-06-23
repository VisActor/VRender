import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerPolygon } from '@visactor/vrender-kits/register/register-polygon';

export function loadBrushComponent() {
  registerGroup();
  registerPolygon();
}
