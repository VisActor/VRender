import { EnvContribution, contributionRegistry } from '@visactor/vrender-core';
import { BrowserEnvContribution } from './contributions/browser-contribution';
import { BrowserWindowHandlerContribution } from '../window/contributions/browser-contribution';
import { WindowHandlerContribution } from '@visactor/vrender-core';
import { registerBrowserCanvasFactories } from '../canvas/browser/';

/**
 * Registry-based registration for browser env/window
 */
export function loadBrowserEnv() {
  registerBrowserCanvasFactories();
  // Env contribution
  contributionRegistry.register(EnvContribution, new BrowserEnvContribution());
  // Window handler contribution
  contributionRegistry.register(WindowHandlerContribution, new BrowserWindowHandlerContribution());
}
