import { EnvContribution, application, WindowHandlerContribution } from '@visactor/vrender-core';
import { HarmonyWindowHandlerContribution } from '../window/contributions/harmony-contribution';
import { HarmonyEnvContribution } from './contributions/harmony-contribution';

/** Registry-based registration for harmony env/window */
export function registerHarmonyEnvRegistry() {
  application.contributions.register(EnvContribution, new HarmonyEnvContribution());
  application.contributions.register(WindowHandlerContribution, new HarmonyWindowHandlerContribution());
}
