import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerSymbol } from '@visactor/vrender-kits/register/register-symbol';
import { registerText } from '@visactor/vrender-kits/register/register-text';

export function loadPagerComponent() {
  registerGroup();
  registerSymbol();
  registerText();
}
