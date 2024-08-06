import { registerGroup, registerSymbol, registerLine, registerText } from '@visactor/vrender-kits';

export function loadTimelineComponent() {
  registerGroup();
  registerText();
  registerSymbol();
  registerLine();
}
