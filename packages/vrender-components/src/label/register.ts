import { registerGroup, registerLine, registerRichtext, registerText } from '@visactor/vrender-kits';

export function loadLabelComponent() {
  registerGroup();
  registerText();
  registerRichtext();
  registerLine();
}
