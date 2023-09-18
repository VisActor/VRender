import { ContainerModule, EnvContribution } from '@visactor/vrender-core';
import { BrowserEnvContribution } from './browser-contribution';
import { FeishuEnvContribution } from './feishu-contribution';
import { TaroEnvContribution } from './taro-contribution';
import { LynxEnvContribution } from './lynx-contribution';
import { WxEnvContribution } from './wx-contribution';
import { NodeEnvContribution } from './node-contribution';

export const allEnvModule = new ContainerModule(bind => {
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
});

export const browserEnvModule = new ContainerModule(bind => {
  // browser
  bind(BrowserEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(BrowserEnvContribution);
});

export const feishuEnvModule = new ContainerModule(bind => {
  // feishu
  bind(FeishuEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(FeishuEnvContribution);
});

export const taroEnvModule = new ContainerModule(bind => {
  // taro
  bind(TaroEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(TaroEnvContribution);
});

export const ttEnvModule = new ContainerModule(bind => {
  // taro
  bind(TaroEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(TaroEnvContribution);
});

export const lynxEnvModule = new ContainerModule(bind => {
  // lynx
  bind(LynxEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(LynxEnvContribution);
});

export const wxEnvModule = new ContainerModule(bind => {
  // wx
  bind(WxEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(WxEnvContribution);
});

export const nodeEnvModule = new ContainerModule(bind => {
  // node
  bind(NodeEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(NodeEnvContribution);
});
