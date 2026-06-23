import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';
import { registerSymbol } from '@visactor/vrender-kits/register/register-symbol';
import { registerText } from '@visactor/vrender-kits/register/register-text';

export function loadSliderComponent() {
  registerGroup();
  registerText();
  registerRect();
  registerSymbol();
}
