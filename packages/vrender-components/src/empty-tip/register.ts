import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerImage } from '@visactor/vrender-kits/register/register-image';
import { registerText } from '@visactor/vrender-kits/register/register-text';

export function loadEmptyTipComponent() {
  registerGroup();
  // registerRect();
  registerText();
  registerImage();
}
