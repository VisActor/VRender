import { container, InteractiveSubRenderContribution, AutoEnablePlugins } from '@visactor/vrender';
import { ContainerModule } from 'inversify';
import { PopTipRenderContribution } from './contribution';
import { PopTipPlugin } from './poptip-plugin';

export const module = new ContainerModule(bind => {
  bind(PopTipRenderContribution).toSelf().inSingletonScope();
  bind(InteractiveSubRenderContribution).toService(PopTipRenderContribution);

  bind(PopTipPlugin).toSelf().inSingletonScope();
  bind(AutoEnablePlugins).toService(PopTipPlugin);
});

export function enablePoptip() {
  container.load(module);
}
