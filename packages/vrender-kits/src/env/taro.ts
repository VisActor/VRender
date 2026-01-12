import { EnvContribution, application, WindowHandlerContribution } from '@visactor/vrender-core';
import { TaroWindowHandlerContribution } from '../window/contributions/taro-contribution';
import { TaroEnvContribution } from './contributions/taro-contribution';

// Legacy ContainerModule and loaders removed (registry-only)

/** Registry-based registration for taro env/window */
export function registerTaroEnvRegistry() {
  application.contributions.register(EnvContribution, new TaroEnvContribution());
  application.contributions.register(WindowHandlerContribution, new TaroWindowHandlerContribution());
}
