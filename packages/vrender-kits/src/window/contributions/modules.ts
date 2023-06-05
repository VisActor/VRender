import { ContainerModule } from 'inversify';
import { bindContributionProvider, WindowHandlerContribution } from '@visactor/vrender';
import { NodeWindowHandlerContribution } from './node-contribution';

export default new ContainerModule(bind => {
  bind(NodeWindowHandlerContribution).toSelf().inSingletonScope();
  bind(WindowHandlerContribution).toService(NodeWindowHandlerContribution);
  // bindContributionProvider(bind, WindowHandlerContribution);
});
