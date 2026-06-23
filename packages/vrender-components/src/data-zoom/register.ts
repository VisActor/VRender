import { registerArea } from '@visactor/vrender-kits/register/register-area';
import { registerLine } from '@visactor/vrender-kits/register/register-line';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';
import { registerSymbol } from '@visactor/vrender-kits/register/register-symbol';
import { loadTagComponent } from '../tag/register';
export function loadDataZoomComponent() {
  loadTagComponent();
  registerRect();
  registerSymbol();
  registerArea();
  registerLine();
}
