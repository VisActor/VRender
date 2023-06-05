import { ContainerModule } from 'inversify';
import { bindContributionProvider } from '../../../common/contribution-provider';
import { WindowHandlerContribution } from '../..';
import { BrowserWindowHandlerContribution } from './browser-contribution';
import { FeishuWindowHandlerContribution } from './feishu-contribution';
import { TaroWindowHandlerContribution } from './taro-contribution';
import { LynxWindowHandlerContribution } from './lynx-contribution';
// import { NodeWindowHandlerContribution } from './node-contribution';

export default new ContainerModule(bind => {
  // browser
  bind(BrowserWindowHandlerContribution).toSelf();
  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(BrowserWindowHandlerContribution))
    .whenTargetNamed(BrowserWindowHandlerContribution.env);

  // feishu
  bind(FeishuWindowHandlerContribution).toSelf();
  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(FeishuWindowHandlerContribution))
    .whenTargetNamed(FeishuWindowHandlerContribution.env);

  // taro
  bind(TaroWindowHandlerContribution).toSelf();

  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(TaroWindowHandlerContribution))
    .whenTargetNamed(TaroWindowHandlerContribution.env);

  // lynx
  bind(LynxWindowHandlerContribution).toSelf();

  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(LynxWindowHandlerContribution))
    .whenTargetNamed(LynxWindowHandlerContribution.env);
  // bind(NodeWindowHandlerContribution).toSelf().inSingletonScope();
  // bind(WindowHandlerContribution).toService(NodeWindowHandlerContribution);
  // bindContributionProvider(bind, WindowHandlerContribution);
});
