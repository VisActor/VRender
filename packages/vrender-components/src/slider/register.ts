import { registerGroup, registerRect, registerSymbol, registerText } from '@visactor/vrender/es/register';

export function loadSliderComponent() {
  registerGroup();
  registerText();
  registerRect();
  registerSymbol();
}
