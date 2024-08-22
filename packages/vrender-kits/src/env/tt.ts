import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
import { ttCanvasModule } from '../canvas/contributions/tt/modules';
import { ttWindowModule } from '../window/contributions/tt-contribution';
import { loadMathPicker } from '../picker/math-module';
import { TTEnvContribution } from './contributions/tt-contribution';

export const ttEnvModule = new ContainerModule(bind => {
  // feishu
  if (!(ttEnvModule as any).isTTBound) {
    (ttEnvModule as any).isTTBound = true;
    bind(TTEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(TTEnvContribution);
  }
});

(ttEnvModule as any).isTTBound = false;

export function loadTTEnv(container: Container, loadPicker: boolean = true) {
  if (!loadTTEnv.__loaded) {
    loadTTEnv.__loaded = true;
    container.load(ttEnvModule);
    container.load(ttCanvasModule);
    container.load(ttWindowModule);
    loadPicker && loadMathPicker(container);
  }
}

loadTTEnv.__loaded = false;

export function initTTEnv() {
  loadTTEnv(container);
}
