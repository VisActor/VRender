import { registerGroup, registerSymbol, registerLine, registerText } from '@visactor/vrender-kits';

export function loadLabelItemComponent() {
  registerGroup();
  registerText();
  registerSymbol();
  registerLine();
}
