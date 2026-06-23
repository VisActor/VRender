import { registerCircle } from '@visactor/vrender-kits/register/register-circle';
import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';
import { registerText } from '@visactor/vrender-kits/register/register-text';

export function loadSwitchComponent() {
  registerGroup();
  registerRect();
  registerText();
  registerCircle();
}
