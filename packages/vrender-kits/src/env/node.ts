import { EnvContribution, contributionRegistry } from '@visactor/vrender-core';
// import { loadMathPicker } from '../picker/math-module';
// import { nodeEnvModule } from './contributions/module';
import { NodeEnvContribution } from './contributions/node-contribution';
import { NodeWindowHandlerContribution } from '../window/contributions/node-contribution';
import { WindowHandlerContribution } from '@visactor/vrender-core';

// Legacy ContainerModule and loaders removed (registry-only)

/**
 * Registry-based registration for node env/window
 */
export function registerNodeEnvRegistry() {
  // Env contribution
  contributionRegistry.register(EnvContribution, new NodeEnvContribution());
  // Window handler contribution
  contributionRegistry.register(WindowHandlerContribution, new NodeWindowHandlerContribution());
}
