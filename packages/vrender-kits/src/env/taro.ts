import { EnvContribution, contributionRegistry, WindowHandlerContribution } from '@visactor/vrender-core';
import { TaroWindowHandlerContribution } from '../window/contributions/taro-contribution';
import { TaroEnvContribution } from './contributions/taro-contribution';

// Legacy ContainerModule and loaders removed (registry-only)

/** Registry-based registration for taro env/window */
export function registerTaroEnvRegistry() {
  contributionRegistry.register(EnvContribution, new TaroEnvContribution());
  contributionRegistry.register(WindowHandlerContribution, new TaroWindowHandlerContribution());
}
