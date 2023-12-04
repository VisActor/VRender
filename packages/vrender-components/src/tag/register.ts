import {
  registerGroup,
  registerRect,
  registerRichtext,
  registerSymbol,
  registerText
} from '@visactor/vrender/es/register';

export function loadTag() {
  registerGroup();
  registerRect();
  registerSymbol();
  registerRichtext();
  registerText();
}
