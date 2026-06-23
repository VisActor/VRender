import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerLine } from '@visactor/vrender-kits/register/register-line';
import { registerSymbol } from '@visactor/vrender-kits/register/register-symbol';
import { registerText } from '@visactor/vrender-kits/register/register-text';

export function loadLabelItemComponent() {
  registerGroup();
  registerText();
  registerSymbol();
  registerLine();
}
