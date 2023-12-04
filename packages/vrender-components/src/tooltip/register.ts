import {
  registerGroup,
  registerRect,
  registerRichtext,
  registerSymbol,
  registerText
} from '@visactor/vrender/es/register';

export function loadTooltipComponent() {
  registerGroup();
  registerRect();
  registerSymbol();
  registerText();
  registerRichtext();
}
