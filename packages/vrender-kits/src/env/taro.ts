import { EnvContribution, contributionRegistry, WindowHandlerContribution } from '@visactor/vrender-core';
import { TaroWindowHandlerContribution } from '../window/contributions/taro-contribution';
import { TaroEnvContribution } from './contributions/taro-contribution';
import { registerTaroCanvasFactories } from '../canvas';

/** Registry-based registration for taro env/window */
export function loadTaroEnv() {
  registerTaroCanvasFactories();
  contributionRegistry.register(EnvContribution, new TaroEnvContribution());
  contributionRegistry.register(WindowHandlerContribution, new TaroWindowHandlerContribution());
}
