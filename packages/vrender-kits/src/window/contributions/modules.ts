import { ContainerModule, WindowHandlerContribution } from '@visactor/vrender-core';
import { BrowserWindowHandlerContribution } from './browser-contribution';
import { FeishuWindowHandlerContribution } from './feishu-contribution';
import { TaroWindowHandlerContribution } from './taro-contribution';
import { LynxWindowHandlerContribution } from './lynx-contribution';
import { NodeWindowHandlerContribution } from './node-contribution';
import { WxWindowHandlerContribution } from './wx-contribution';
// import { NodeWindowHandlerContribution } from './node-contribution';

export const allWindowModule = new ContainerModule(bind => {
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

  // wx
  bind(WxWindowHandlerContribution).toSelf();

  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(WxWindowHandlerContribution))
    .whenTargetNamed(WxWindowHandlerContribution.env);

  // node
  bind(NodeWindowHandlerContribution).toSelf();

  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(NodeWindowHandlerContribution))
    .whenTargetNamed(NodeWindowHandlerContribution.env);
  // bind(NodeWindowHandlerContribution).toSelf().inSingletonScope();
  // bind(WindowHandlerContribution).toService(NodeWindowHandlerContribution);
  // bindContributionProvider(bind, WindowHandlerContribution);
});

export const browserWindowModule = new ContainerModule(bind => {
  // browser
  bind(BrowserWindowHandlerContribution).toSelf();
  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(BrowserWindowHandlerContribution))
    .whenTargetNamed(BrowserWindowHandlerContribution.env);
});

export const feishuWindowModule = new ContainerModule(bind => {
  // feishu
  bind(FeishuWindowHandlerContribution).toSelf();
  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(FeishuWindowHandlerContribution))
    .whenTargetNamed(FeishuWindowHandlerContribution.env);
});

export const taroWindowModule = new ContainerModule(bind => {
  // taro
  bind(TaroWindowHandlerContribution).toSelf();
  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(TaroWindowHandlerContribution))
    .whenTargetNamed(TaroWindowHandlerContribution.env);
});

export const lynxWindowModule = new ContainerModule(bind => {
  // lynx
  bind(LynxWindowHandlerContribution).toSelf();
  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(LynxWindowHandlerContribution))
    .whenTargetNamed(LynxWindowHandlerContribution.env);
});

export const wxWindowModule = new ContainerModule(bind => {
  // wx
  bind(WxWindowHandlerContribution).toSelf();
  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(WxWindowHandlerContribution))
    .whenTargetNamed(WxWindowHandlerContribution.env);
});

export const nodeWindowModule = new ContainerModule(bind => {
  // node
  bind(NodeWindowHandlerContribution).toSelf();
  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(NodeWindowHandlerContribution))
    .whenTargetNamed(NodeWindowHandlerContribution.env);
});
