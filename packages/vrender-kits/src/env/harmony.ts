import { EnvContribution, contributionRegistry, WindowHandlerContribution } from '@visactor/vrender-core';
import { HarmonyWindowHandlerContribution } from '../window/contributions/harmony-contribution';
import { HarmonyEnvContribution } from './contributions/harmony-contribution';

/** Registry-based registration for harmony env/window */
export function registerHarmonyEnvRegistry() {
  contributionRegistry.register(EnvContribution, new HarmonyEnvContribution());
  contributionRegistry.register(WindowHandlerContribution, new HarmonyWindowHandlerContribution());
}
