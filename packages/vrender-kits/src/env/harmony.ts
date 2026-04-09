import { EnvContribution, getLegacyBindingContext } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
import { bindHarmonyWindowContribution } from '../window/contributions/harmony-contribution';
import { bindHarmonyCanvasModules } from '../canvas/contributions/harmony/modules';
import { HarmonyEnvContribution } from './contributions/harmony-contribution';
import type { LegacyBindContainer, LegacyContainer } from '../common/legacy-container';

let isHarmonyBound = false;

export function bindHarmonyEnv(container: LegacyBindContainer) {
  if (!isHarmonyBound) {
    isHarmonyBound = true;
    container.bind(HarmonyEnvContribution).toSelf().inSingletonScope();
    container.bind(EnvContribution).toService(HarmonyEnvContribution);
  }
}

export function loadHarmonyEnv(container: LegacyContainer = getLegacyBindingContext(), loadPicker: boolean = true) {
  if (!loadHarmonyEnv.__loaded) {
    loadHarmonyEnv.__loaded = true;
    bindHarmonyEnv(container);
    bindHarmonyCanvasModules(container);
    bindHarmonyWindowContribution(container);
    loadPicker && loadMathPicker(container);
  }
}

loadHarmonyEnv.__loaded = false;

export function initHarmonyEnv() {
  loadHarmonyEnv();
}
