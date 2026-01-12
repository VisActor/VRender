import { EnvContribution, contributionRegistry, WindowHandlerContribution } from '@visactor/vrender-core';
import { TTWindowHandlerContribution } from '../window/contributions/tt-contribution';
import { TTEnvContribution } from './contributions/tt-contribution';

/** Registry-based registration for tt env/window */
export function registerTtEnvRegistry() {
  contributionRegistry.register(EnvContribution, new TTEnvContribution());
  contributionRegistry.register(WindowHandlerContribution, new TTWindowHandlerContribution());
}
