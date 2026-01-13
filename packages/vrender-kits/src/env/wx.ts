import { EnvContribution, contributionRegistry, WindowHandlerContribution } from '@visactor/vrender-core';
// import { loadMathPicker } from '../picker/math-module';
// import { wxEnvModule } from './contributions/module';
import { registerWxCanvasFactories } from '../canvas/wx';
import { WxWindowHandlerContribution } from '../window/contributions/wx-contribution';
import { WxEnvContribution } from './contributions/wx-contribution';

// Legacy ContainerModule and loaders removed (registry-only)

/** Registry-based registration for wx env/window */
export function loadWxEnv() {
  contributionRegistry.register(EnvContribution, new WxEnvContribution());
  // ensure canvas factories for wx are registered
  registerWxCanvasFactories();
  contributionRegistry.register(WindowHandlerContribution, new WxWindowHandlerContribution());
}
