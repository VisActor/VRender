import { registerGroup, registerRichtext, registerText } from '@visactor/vrender-kits';

export function loadTitleComponent() {
  registerGroup();
  registerText();
  registerRichtext();
}
