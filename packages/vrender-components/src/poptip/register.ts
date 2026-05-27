import { merge } from '@visactor/vutils';
import type { PopTipAttributes } from './type';
import { DEFAULT_THEME, theme } from './theme';
import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';
import { registerSymbol } from '@visactor/vrender-kits/register/register-symbol';
import { registerText } from '@visactor/vrender-kits/register/register-text';

export function loadPoptipComponent() {
  registerGroup();
  registerText();
  registerSymbol();
  registerRect();
}

export function setPoptipTheme(defaultPoptipTheme: PopTipAttributes) {
  merge(theme.poptip, DEFAULT_THEME, defaultPoptipTheme);
}
