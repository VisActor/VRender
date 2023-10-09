import { ContainerModule, EnvContribution } from '@visactor/vrender-core';
import { BrowserEnvContribution } from './browser-contribution';
import { FeishuEnvContribution } from './feishu-contribution';
import { TaroEnvContribution } from './taro-contribution';
import { LynxEnvContribution } from './lynx-contribution';
import { WxEnvContribution } from './wx-contribution';
import { NodeEnvContribution } from './node-contribution';

let isBrowserBound = false;
export const browserEnvModule = new ContainerModule(bind => {
  // browser
  if (!isBrowserBound) {
    isBrowserBound = true;
    bind(BrowserEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(BrowserEnvContribution);
  }
});

let isFeishuBound = false;
export const feishuEnvModule = new ContainerModule(bind => {
  // feishu
  if (!isFeishuBound) {
    isFeishuBound = true;
    bind(FeishuEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(FeishuEnvContribution);
  }
});

let isTaroBound = false;
export const taroEnvModule = new ContainerModule(bind => {
  // taro
  if (!isTaroBound) {
    isTaroBound = true;
    bind(TaroEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(TaroEnvContribution);
  }
});

let isTTBound = false;
export const ttEnvModule = new ContainerModule(bind => {
  if (!isTTBound) {
    isTTBound = true;
    bind(TaroEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(TaroEnvContribution);
  }
});

let isLynxBound = false;
export const lynxEnvModule = new ContainerModule(bind => {
  // lynx
  if (!isLynxBound) {
    isLynxBound = true;
    bind(LynxEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(LynxEnvContribution);
  }
});

let isWxBound = false;
export const wxEnvModule = new ContainerModule(bind => {
  // wx
  if (!isWxBound) {
    isWxBound = true;
    bind(WxEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(WxEnvContribution);
  }
});

let isNodeBound = false;
export const nodeEnvModule = new ContainerModule(bind => {
  // node
  if (!isNodeBound) {
    isNodeBound = true;
    bind(NodeEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(NodeEnvContribution);
  }
});
