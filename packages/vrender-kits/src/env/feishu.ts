import { EnvContribution, contributionRegistry, WindowHandlerContribution } from '@visactor/vrender-core';
import { FeishuWindowHandlerContribution } from '../window/contributions/feishu-contribution';
import { FeishuEnvContribution } from './contributions/feishu-contribution';
import { registerFeishuCanvasFactories } from '../canvas';

/** Registry-based registration for feishu env/window */
export function loadFeishuEnv() {
  registerFeishuCanvasFactories();
  contributionRegistry.register(EnvContribution, new FeishuEnvContribution());
  contributionRegistry.register(WindowHandlerContribution, new FeishuWindowHandlerContribution());
}
