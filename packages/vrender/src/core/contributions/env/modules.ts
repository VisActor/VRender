import { ContainerModule } from 'inversify';
import { bindContributionProvider } from '../../../common/contribution-provider';
import { EnvContribution } from '../../../interface';
import { BrowserEnvContribution } from './browser-contribution';
import { FeishuEnvContribution } from './feishu-contribution';
import { TaroEnvContribution } from './taro-contribution';
import { LynxEnvContribution } from './lynx-contribution';

export default new ContainerModule(bind => {
  // browser
  bind(BrowserEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(BrowserEnvContribution);

  // feishu
  bind(FeishuEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(FeishuEnvContribution);

  // taro
  bind(TaroEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(TaroEnvContribution);

  // lynx
  bind(LynxEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(LynxEnvContribution);

  bindContributionProvider(bind, EnvContribution);
});
