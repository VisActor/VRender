import { ContainerModule, EnvContribution } from '@visactor/vrender-core';
import { FeishuEnvContribution } from './feishu-contribution';

export const feishuEnvModule = new ContainerModule(bind => {
  // feishu
  bind(FeishuEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(FeishuEnvContribution);
});
