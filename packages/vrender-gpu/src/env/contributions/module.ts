import { ContainerModule } from 'inversify';
import { NativeEnvContribution } from './native-contribution';
import { EnvContribution } from '@visactor/vrender';

export const nativeEnvContainer = new ContainerModule(bind => {
  bind(NativeEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(NativeEnvContribution);
});
