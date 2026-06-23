import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerImage } from '@visactor/vrender-kits/register/register-image';
import { registerText } from '@visactor/vrender-kits/register/register-text';

export function loadTableSeriesNumberComponent() {
  registerGroup();
  // registerRect();
  registerText();
  registerImage();
}
