import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
// import { browserEnvModule } from './contributions/module';
import { browserCanvasModule } from '../canvas/contributions/browser/modules';
import { loadCanvasPicker } from '../picker/canvas-module';
import { browserWindowModule } from '../window/contributions/browser-contribution';
import { BrowserEnvContribution } from './contributions/browser-contribution';

export const browserEnvModule = new ContainerModule(bind => {
  // browser
  if (!(browserEnvModule as any).isBrowserBound) {
    (browserEnvModule as any).isBrowserBound = true;
    bind(BrowserEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(BrowserEnvContribution);
  }
});

(browserEnvModule as any).isBrowserBound = false;

export function loadBrowserEnv(container: Container, loadPicker: boolean = true) {
  if (!loadBrowserEnv.__loaded) {
    loadBrowserEnv.__loaded = true;
    container.load(browserEnvModule);
    container.load(browserCanvasModule);
    container.load(browserWindowModule);
    loadPicker && loadCanvasPicker(container);
  }
}

loadBrowserEnv.__loaded = false;

export function initBrowserEnv() {
  loadBrowserEnv(container);
}
