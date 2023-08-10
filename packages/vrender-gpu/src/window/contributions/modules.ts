import { ContainerModule } from 'inversify';
import { WindowHandlerContribution } from '@visactor/vrender';
import { NativeWindowHandlerContribution } from './native-contribution';

export const nativeWindowContainer = new ContainerModule(bind => {
  bind(NativeWindowHandlerContribution).toSelf().inSingletonScope();
  bind(WindowHandlerContribution).toService(NativeWindowHandlerContribution);
  // bindContributionProvider(bind, WindowHandlerContribution);
});
