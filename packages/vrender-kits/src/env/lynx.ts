import { container, type Container } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
import { lynxWindowModule } from '../window/contributions/lynx-contribution';
import { lynxCanvasModule } from '../canvas/contributions/lynx/modules';
import { lynxEnvModule } from './contributions/module';

let loaded = false;
export function loadLynxEnv(container: Container, loadPicker: boolean = true) {
  if (!loaded) {
    loaded = true;
    container.load(lynxEnvModule);
    container.load(lynxCanvasModule);
    container.load(lynxWindowModule);
    loadPicker && loadMathPicker(container);
  }
}

export function initLynxEnv() {
  loadLynxEnv(container);
}
