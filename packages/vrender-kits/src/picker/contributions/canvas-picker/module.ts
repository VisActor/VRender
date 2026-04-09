import { bindContributionProvider } from '@visactor/vrender-core';
import { CanvasGroupPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasGroupPicker } from './group-picker';
import type { LegacyBindContainer } from '../../../common/legacy-container';

let loaded = false;

export function bindCanvasPickerContribution(c: LegacyBindContainer) {
  if (loaded) {
    return;
  }
  loaded = true;
  c.bind(CanvasGroupPicker)
    .toDynamicValue(() => new DefaultCanvasGroupPicker())
    .inSingletonScope();
  c.bind(CanvasPickerContribution).toService(CanvasGroupPicker);

  bindContributionProvider(c.bind.bind(c) as any, CanvasPickerContribution);
}
