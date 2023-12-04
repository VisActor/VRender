import { registerGroup, registerRichtext, registerText } from '@visactor/vrender/es/register';

export function loadIndicatorComponent() {
  registerGroup();
  registerText();
  registerRichtext();
}
