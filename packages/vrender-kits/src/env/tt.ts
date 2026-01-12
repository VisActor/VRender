import { EnvContribution, application, WindowHandlerContribution } from '@visactor/vrender-core';
import { TTWindowHandlerContribution } from '../window/contributions/tt-contribution';
import { TTEnvContribution } from './contributions/tt-contribution';

/** Registry-based registration for tt env/window */
export function registerTtEnvRegistry() {
  application.contributions.register(EnvContribution, new TTEnvContribution());
  application.contributions.register(WindowHandlerContribution, new TTWindowHandlerContribution());
}
