import { bindContributionProvider } from '@visactor/vrender-core';
import { MathPickerContribution } from '../constants';
import type { LegacyBindContainer } from '../../../common/legacy-container';

let loaded = false;

export function bindMathPickerContribution(c: LegacyBindContainer) {
  if (loaded) {
    return;
  }
  loaded = true;

  bindContributionProvider(c.bind.bind(c) as any, MathPickerContribution);
}
