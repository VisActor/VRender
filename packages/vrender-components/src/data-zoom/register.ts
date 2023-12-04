import { registerArea, registerLine, registerRect, registerSymbol } from '@visactor/vrender/es/register';
import { loadTagComponent } from '../tag/register';
export function loadDataZoomComponent() {
  loadTagComponent();
  registerRect();
  registerSymbol();
  registerArea();
  registerLine();
}
