import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
import { harmonyWindowModule } from '../window/contributions/harmony-contribution';
import { harmonyCanvasModule } from '../canvas/contributions/harmony/modules';
import { HarmonyEnvContribution } from './contributions/harmony-contribution';

export const harmonyEnvModule = new ContainerModule(bind => {
  // harmony
  if (!(harmonyEnvModule as any).isHarmonyBound) {
    (harmonyEnvModule as any).isHarmonyBound = true;
    bind(HarmonyEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(HarmonyEnvContribution);
  }
});

(harmonyEnvModule as any).isHarmonyBound = false;

export function loadHarmonyEnv(container: Container, loadPicker: boolean = true) {
  if (!loadHarmonyEnv.__loaded) {
    loadHarmonyEnv.__loaded = true;
    container.load(harmonyEnvModule);
    container.load(harmonyCanvasModule);
    container.load(harmonyWindowModule);
    loadPicker && loadMathPicker(container);
  }
}

loadHarmonyEnv.__loaded = false;

export function initHarmonyEnv() {
  loadHarmonyEnv(container);
}
