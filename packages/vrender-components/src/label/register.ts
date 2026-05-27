import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerLine } from '@visactor/vrender-kits/register/register-line';
import { registerRichtext } from '@visactor/vrender-kits/register/register-richtext';
import { registerText } from '@visactor/vrender-kits/register/register-text';
import { registerLabelAnimate } from '../animation/label-animate';

export function loadLabelComponent() {
  registerGroup();
  registerText();
  registerRichtext();
  registerLine();
  registerLabelAnimate();
}

export function loadLabelAnimate() {
  registerLabelAnimate();
}
