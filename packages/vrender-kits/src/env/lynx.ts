import { EnvContribution, contributionRegistry, WindowHandlerContribution } from '@visactor/vrender-core';
import { LynxWindowHandlerContribution } from '../window/contributions/lynx-contribution';
import { LynxEnvContribution } from './contributions/lynx-contribution';
// import { lynxEnvModule } from './contributions/module';

// Legacy ContainerModule and loaders removed (registry-only)

/** Registry-based registration for lynx env/window */
export function registerLynxEnvRegistry() {
  contributionRegistry.register(EnvContribution, new LynxEnvContribution());
  contributionRegistry.register(WindowHandlerContribution, new LynxWindowHandlerContribution());
}
