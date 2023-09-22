import { container, type Container } from '@visactor/vrender-core';
import { browserEnvModule } from './contributions/browser-module';
import { browserCanvasModule } from '../canvas/contributions/browser/modules';
import { loadCanvasPicker } from '../picker/canvas-module';
import { browserWindowModule } from '../window/contributions/browser-contribution';

export function loadBrowserEnv(container: Container, loadPicker: boolean = true) {
  container.load(browserEnvModule);
  container.load(browserCanvasModule);
  container.load(browserWindowModule);
  loadPicker && loadCanvasPicker(container);
}

export function initBrowserEnv() {
  loadBrowserEnv(container);
}
