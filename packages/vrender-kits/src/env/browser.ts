import { EnvContribution, contributionRegistry } from '@visactor/vrender-core';
// import { browserEnvModule } from './contributions/module';
import { BrowserEnvContribution } from './contributions/browser-contribution';
import { BrowserWindowHandlerContribution } from '../window/contributions/browser-contribution';
import { WindowHandlerContribution } from '@visactor/vrender-core';
import { registerBrowserCanvasFactories } from '../canvas/contributions/browser/modules';

// Legacy ContainerModule and loaders removed (registry-only)

/**
 * Registry-based registration for browser env/window
 */
export function registerBrowserEnvRegistry() {
  registerBrowserCanvasFactories();
  // Env contribution
  contributionRegistry.register(EnvContribution, new BrowserEnvContribution());
  // Window handler contribution
  contributionRegistry.register(WindowHandlerContribution, new BrowserWindowHandlerContribution());
}
