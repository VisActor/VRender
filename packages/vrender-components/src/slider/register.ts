import { registerGroup, registerRect, registerSymbol, registerText } from '@visactor/vrender/es/register';

export function loadSlider() {
  registerGroup();
  registerText();
  registerRect();
  registerSymbol();
}
