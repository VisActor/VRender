import { registerGroup, registerWrapText, registerRichtext } from '@visactor/vrender/es/register';

export function loadTitle() {
  registerGroup();
  registerWrapText();
  registerRichtext();
}
