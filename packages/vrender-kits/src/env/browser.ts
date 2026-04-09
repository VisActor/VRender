import { EnvContribution, getLegacyBindingContext } from '@visactor/vrender-core';
// import { browserEnvModule } from './contributions/module';
import { bindBrowserCanvasModules } from '../canvas/contributions/browser/modules';
import { loadCanvasPicker } from '../picker/canvas-module';
import { bindBrowserWindowContribution } from '../window/contributions/browser-contribution';
import { BrowserEnvContribution } from './contributions/browser-contribution';
import type { LegacyBindContainer, LegacyContainer } from '../common/legacy-container';

let isBrowserBound = false;

export function bindBrowserEnv(container: LegacyBindContainer) {
  if (!isBrowserBound) {
    isBrowserBound = true;
    container.bind(BrowserEnvContribution).toSelf().inSingletonScope();
    container.bind(EnvContribution).toService(BrowserEnvContribution);
  }
}

export function loadBrowserEnv(container: LegacyContainer = getLegacyBindingContext(), loadPicker: boolean = true) {
  if (!loadBrowserEnv.__loaded) {
    loadBrowserEnv.__loaded = true;
    bindBrowserEnv(container);
    bindBrowserCanvasModules(container);
    bindBrowserWindowContribution(container);
    loadPicker && loadCanvasPicker(container);
  }
}

loadBrowserEnv.__loaded = false;

export function initBrowserEnv() {
  loadBrowserEnv();
}
