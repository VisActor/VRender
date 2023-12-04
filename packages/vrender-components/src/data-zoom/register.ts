import { registerArea, registerLine, registerRect, registerSymbol } from '@visactor/vrender/es/register';
import { loadTag } from '../tag/register';
export function loadDataZoom() {
  loadTag();
  registerRect();
  registerSymbol();
  registerArea();
  registerLine();
}
