import { registerGroup, registerWrapText, registerRichtext } from '@visactor/vrender-kits';

export function loadTitleComponent() {
  registerGroup();
  registerWrapText();
  registerRichtext();
}
