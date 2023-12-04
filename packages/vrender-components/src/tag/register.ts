import {
  registerGroup,
  registerRect,
  registerRichtext,
  registerSymbol,
  registerText
} from '@visactor/vrender/es/register';

export function loadTagComponent() {
  registerGroup();
  registerRect();
  registerSymbol();
  registerRichtext();
  registerText();
}
