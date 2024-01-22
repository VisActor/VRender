import { ContainerModule, bindContributionProvider } from '@visactor/vrender-core';
import { CanvasGroupPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasGroupPicker } from './group-picker';

const m = new ContainerModule((bind, unbind, isBound, rebind) => {
  if ((m as any).__vloaded) {
    return;
  }
  (m as any).__vloaded = true;
  // group picker
  bind(CanvasGroupPicker).to(DefaultCanvasGroupPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasGroupPicker);

  bindContributionProvider(bind, CanvasPickerContribution);
});

(m as any).__vloaded = false;

export default m;
