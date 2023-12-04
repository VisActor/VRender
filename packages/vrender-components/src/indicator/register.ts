import { registerGroup, registerRichtext, registerText } from '@visactor/vrender/es/register';

export function loadIndicator() {
  registerGroup();
  registerText();
  registerRichtext();
}
