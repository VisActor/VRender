import { ContainerModule, bindContributionProvider } from '@visactor/vrender-core';
import { CanvasGroupPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasGroupPicker } from './group-picker';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
  // group picker
  bind(CanvasGroupPicker).to(DefaultCanvasGroupPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasGroupPicker);

  bindContributionProvider(bind, CanvasPickerContribution);
});
