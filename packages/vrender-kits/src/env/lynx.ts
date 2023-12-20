import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
import { lynxWindowModule } from '../window/contributions/lynx-contribution';
import { lynxCanvasModule } from '../canvas/contributions/lynx/modules';
import { LynxEnvContribution } from './contributions/lynx-contribution';
// import { lynxEnvModule } from './contributions/module';

let isLynxBound = false;
export const lynxEnvModule = new ContainerModule(bind => {
  // lynx
  if (!isLynxBound) {
    isLynxBound = true;
    bind(LynxEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(LynxEnvContribution);
  }
});

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
