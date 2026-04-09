import { EnvContribution, getLegacyBindingContext } from '@visactor/vrender-core';
import { bindTTCanvasModules } from '../canvas/contributions/tt/modules';
import { bindTTWindowContribution } from '../window/contributions/tt-contribution';
import { loadMathPicker } from '../picker/math-module';
import { TTEnvContribution } from './contributions/tt-contribution';
import type { LegacyBindContainer, LegacyContainer } from '../common/legacy-container';

let isTTBound = false;

export function bindTTEnv(container: LegacyBindContainer) {
  if (!isTTBound) {
    isTTBound = true;
    container.bind(TTEnvContribution).toSelf().inSingletonScope();
    container.bind(EnvContribution).toService(TTEnvContribution);
  }
}

export function loadTTEnv(container: LegacyContainer = getLegacyBindingContext(), loadPicker: boolean = true) {
  if (!loadTTEnv.__loaded) {
    loadTTEnv.__loaded = true;
    bindTTEnv(container);
    bindTTCanvasModules(container);
    bindTTWindowContribution(container);
    loadPicker && loadMathPicker(container);
  }
}

loadTTEnv.__loaded = false;

export function initTTEnv() {
  loadTTEnv();
}
