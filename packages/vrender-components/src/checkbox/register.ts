import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerImage } from '@visactor/vrender-kits/register/register-image';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';
import { registerText } from '@visactor/vrender-kits/register/register-text';

export function loadCheckBoxComponent() {
  registerGroup();
  registerRect();
  registerText();
  registerImage();
}
