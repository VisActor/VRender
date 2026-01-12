import { EnvContribution, contributionRegistry, WindowHandlerContribution } from '@visactor/vrender-core';
import { FeishuWindowHandlerContribution } from '../window/contributions/feishu-contribution';
import { FeishuEnvContribution } from './contributions/feishu-contribution';

// Legacy ContainerModule and loaders removed (registry-only)

/** Registry-based registration for feishu env/window */
export function registerFeishuEnvRegistry() {
  contributionRegistry.register(EnvContribution, new FeishuEnvContribution());
  contributionRegistry.register(WindowHandlerContribution, new FeishuWindowHandlerContribution());
}
