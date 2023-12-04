import {
  registerGroup,
  registerRect,
  registerRichtext,
  registerSymbol,
  registerText
} from '@visactor/vrender/es/register';

export function loadTooltip() {
  registerGroup();
  registerRect();
  registerSymbol();
  registerText();
  registerRichtext();
}
