import { EnvContribution, application } from '@visactor/vrender-core';
// import { browserEnvModule } from './contributions/module';
import { BrowserEnvContribution } from './contributions/browser-contribution';
import { BrowserWindowHandlerContribution } from '../window/contributions/browser-contribution';
import { WindowHandlerContribution } from '@visactor/vrender-core';

// Legacy ContainerModule and loaders removed (registry-only)

/**
 * Registry-based registration for browser env/window
 */
export function registerBrowserEnvRegistry() {
  // Env contribution
  application.contributions.register(EnvContribution, new BrowserEnvContribution());
  // Window handler contribution
  application.contributions.register(WindowHandlerContribution, new BrowserWindowHandlerContribution());
}
