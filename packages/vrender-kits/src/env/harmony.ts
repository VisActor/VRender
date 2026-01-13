import { EnvContribution, contributionRegistry, WindowHandlerContribution } from '@visactor/vrender-core';
import { HarmonyWindowHandlerContribution } from '../window/contributions/harmony-contribution';
import { HarmonyEnvContribution } from './contributions/harmony-contribution';
import { registerHarmonyCanvasFactories } from '../canvas';

/** Registry-based registration for harmony env/window */
export function loadHarmonyEnv() {
  registerHarmonyCanvasFactories();
  contributionRegistry.register(EnvContribution, new HarmonyEnvContribution());
  contributionRegistry.register(WindowHandlerContribution, new HarmonyWindowHandlerContribution());
}
