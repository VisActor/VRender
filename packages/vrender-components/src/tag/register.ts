import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';
import { registerRichtext } from '@visactor/vrender-kits/register/register-richtext';
import { registerSymbol } from '@visactor/vrender-kits/register/register-symbol';
import { registerText } from '@visactor/vrender-kits/register/register-text';

export function loadTagComponent() {
  registerGroup();
  registerRect();
  registerSymbol();
  registerRichtext();
  registerText();
}
