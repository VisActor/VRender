import { EnvContribution, getLegacyBindingContext } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
import { bindLynxWindowContribution } from '../window/contributions/lynx-contribution';
import { bindLynxCanvasModules } from '../canvas/contributions/lynx/modules';
import { LynxEnvContribution } from './contributions/lynx-contribution';
// import { lynxEnvModule } from './contributions/module';
import type { LegacyBindContainer, LegacyContainer } from '../common/legacy-container';

let isLynxBound = false;

export function bindLynxEnv(container: LegacyBindContainer) {
  if (!isLynxBound) {
    isLynxBound = true;
    container.bind(LynxEnvContribution).toSelf().inSingletonScope();
    container.bind(EnvContribution).toService(LynxEnvContribution);
  }
}

export function loadLynxEnv(container: LegacyContainer = getLegacyBindingContext(), loadPicker: boolean = true) {
  if (!loadLynxEnv.__loaded) {
    loadLynxEnv.__loaded = true;
    bindLynxEnv(container);
    bindLynxCanvasModules(container);
    bindLynxWindowContribution(container);
    loadPicker && loadMathPicker(container);
  }
}

loadLynxEnv.__loaded = false;

export function initLynxEnv() {
  loadLynxEnv();
}
