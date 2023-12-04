import { registerGroup, registerLine, registerRichtext, registerText } from '@visactor/vrender/es/register';

export function loadLabel() {
  registerGroup();
  registerText();
  registerRichtext();
  registerLine();
}
