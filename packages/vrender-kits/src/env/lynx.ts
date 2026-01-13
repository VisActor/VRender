import { EnvContribution, contributionRegistry, WindowHandlerContribution } from '@visactor/vrender-core';
import { LynxWindowHandlerContribution } from '../window/contributions/lynx-contribution';
import { LynxEnvContribution } from './contributions/lynx-contribution';
import { registerLynxCanvasFactories } from '../canvas';
// import { lynxEnvModule } from './contributions/module';

// Legacy ContainerModule and loaders removed (registry-only)

/** Registry-based registration for lynx env/window */
export function loadLynxEnv() {
  registerLynxCanvasFactories();
  contributionRegistry.register(EnvContribution, new LynxEnvContribution());
  contributionRegistry.register(WindowHandlerContribution, new LynxWindowHandlerContribution());
}
