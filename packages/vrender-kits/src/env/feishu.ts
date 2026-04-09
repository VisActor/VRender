import { EnvContribution, getLegacyBindingContext } from '@visactor/vrender-core';
import { bindFeishuCanvasModules } from '../canvas/contributions/feishu/modules';
import { bindFeishuWindowContribution } from '../window/contributions/feishu-contribution';
import { loadMathPicker } from '../picker/math-module';
import { FeishuEnvContribution } from './contributions/feishu-contribution';
import type { LegacyBindContainer, LegacyContainer } from '../common/legacy-container';

let isFeishuBound = false;

export function bindFeishuEnv(container: LegacyBindContainer) {
  if (!isFeishuBound) {
    isFeishuBound = true;
    container.bind(FeishuEnvContribution).toSelf().inSingletonScope();
    container.bind(EnvContribution).toService(FeishuEnvContribution);
  }
}

export function loadFeishuEnv(container: LegacyContainer = getLegacyBindingContext(), loadPicker: boolean = true) {
  if (!loadFeishuEnv.__loaded) {
    loadFeishuEnv.__loaded = true;
    bindFeishuEnv(container);
    bindFeishuCanvasModules(container);
    bindFeishuWindowContribution(container);
    loadPicker && loadMathPicker(container);
  }
}

loadFeishuEnv.__loaded = false;

export function initFeishuEnv() {
  loadFeishuEnv();
}
