import { container } from '@visactor/vrender-core';
import { merge } from '@visactor/vutils';
import type { PopTipAttributes } from './type';
import { DEFAULT_THEME, theme } from './theme';
import { registerGroup, registerRect, registerSymbol, registerWrapText } from '@visactor/vrender-kits';

export function loadPoptipComponent() {
  registerGroup();
  registerWrapText();
  registerSymbol();
  registerRect();
}

export function setPoptipTheme(defaultPoptipTheme: PopTipAttributes) {
  merge(theme.poptip, DEFAULT_THEME, defaultPoptipTheme);
}
