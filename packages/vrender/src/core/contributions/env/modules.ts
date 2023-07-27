import { ContainerModule } from 'inversify';
import { bindContributionProvider } from '../../../common/contribution-provider';
import { EnvContribution } from '../../../constants';
import { BrowserEnvContribution } from './browser-contribution';
import { FeishuEnvContribution } from './feishu-contribution';
import { TaroEnvContribution } from './taro-contribution';
import { LynxEnvContribution } from './lynx-contribution';
import { NodeEnvContribution } from './node-contribution';
import { WxEnvContribution } from './wx-contribution';

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

  // wx
  bind(WxEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(WxEnvContribution);

  // node
  bind(NodeEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(NodeEnvContribution);

  bindContributionProvider(bind, EnvContribution);
});
