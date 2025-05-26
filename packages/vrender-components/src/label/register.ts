import { registerGroup, registerLine, registerRichtext, registerText } from '@visactor/vrender-kits';
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
