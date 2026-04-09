import { EnvContribution, getLegacyBindingContext } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
// import { taroEnvModule } from './contributions/module';
import { bindTaroCanvasModules } from '../canvas/contributions/taro/modules';
import { bindTaroWindowContribution } from '../window/contributions/taro-contribution';
import { TaroEnvContribution } from './contributions/taro-contribution';
import type { LegacyBindContainer, LegacyContainer } from '../common/legacy-container';

let isTaroBound = false;

export function bindTaroEnv(container: LegacyBindContainer) {
  if (!isTaroBound) {
    isTaroBound = true;
    container.bind(TaroEnvContribution).toSelf().inSingletonScope();
    container.bind(EnvContribution).toService(TaroEnvContribution);
  }
}

export function loadTaroEnv(container: LegacyContainer = getLegacyBindingContext(), loadPicker: boolean = true) {
  if (!loadTaroEnv.__loaded) {
    loadTaroEnv.__loaded = true;
    bindTaroEnv(container);
    bindTaroCanvasModules(container);
    bindTaroWindowContribution(container);
    loadPicker && loadMathPicker(container);
  }
}

loadTaroEnv.__loaded = false;

export function initTaroEnv() {
  loadTaroEnv();
}
