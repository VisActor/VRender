import { registerGroup, registerWrapText, registerRichtext } from '@visactor/vrender/es/register';

export function loadTitleComponent() {
  registerGroup();
  registerWrapText();
  registerRichtext();
}
