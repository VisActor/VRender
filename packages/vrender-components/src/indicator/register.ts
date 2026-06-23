import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerRichtext } from '@visactor/vrender-kits/register/register-richtext';
import { registerText } from '@visactor/vrender-kits/register/register-text';

export function loadIndicatorComponent() {
  registerGroup();
  registerText();
  registerRichtext();
}
