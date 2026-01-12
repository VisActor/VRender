import { EnvContribution, application, WindowHandlerContribution } from '@visactor/vrender-core';
import { FeishuWindowHandlerContribution } from '../window/contributions/feishu-contribution';
import { FeishuEnvContribution } from './contributions/feishu-contribution';

// Legacy ContainerModule and loaders removed (registry-only)

/** Registry-based registration for feishu env/window */
export function registerFeishuEnvRegistry() {
  application.contributions.register(EnvContribution, new FeishuEnvContribution());
  application.contributions.register(WindowHandlerContribution, new FeishuWindowHandlerContribution());
}
