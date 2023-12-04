import { registerGroup, registerLine, registerRichtext, registerText } from '@visactor/vrender/es/register';

export function loadLabelComponent() {
  registerGroup();
  registerText();
  registerRichtext();
  registerLine();
}
