import { ContainerModule, EnvContribution } from '@visactor/vrender-core';
import { BrowserEnvContribution } from './browser-contribution';

export const browserEnvModule = new ContainerModule(bind => {
  // browser
  bind(BrowserEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(BrowserEnvContribution);
});
