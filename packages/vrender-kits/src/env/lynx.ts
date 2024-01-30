import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
import { lynxWindowModule } from '../window/contributions/lynx-contribution';
import { lynxCanvasModule } from '../canvas/contributions/lynx/modules';
import { LynxEnvContribution } from './contributions/lynx-contribution';
// import { lynxEnvModule } from './contributions/module';

export const lynxEnvModule = new ContainerModule(bind => {
  // lynx
  if (!(lynxEnvModule as any).isLynxBound) {
    (lynxEnvModule as any).isLynxBound = true;
    bind(LynxEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(LynxEnvContribution);
  }
});

(lynxEnvModule as any).isLynxBound = false;

export function loadLynxEnv(container: Container, loadPicker: boolean = true) {
  if (!loadLynxEnv.__loaded) {
    loadLynxEnv.__loaded = true;
    container.load(lynxEnvModule);
    container.load(lynxCanvasModule);
    container.load(lynxWindowModule);
    loadPicker && loadMathPicker(container);
  }
}

loadLynxEnv.__loaded = false;

export function initLynxEnv() {
  loadLynxEnv(container);
}
