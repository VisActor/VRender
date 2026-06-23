import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerImage } from '@visactor/vrender-kits/register/register-image';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';
import { registerWrapText } from '@visactor/vrender-kits/register/register-wraptext';

export function loadRadioComponent() {
  registerGroup();
  registerRect();
  registerWrapText();
  registerImage();
}
