import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';

export function loadScrollbarComponent() {
  registerGroup();
  registerRect();
}
