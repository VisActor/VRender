import { EnvContribution, getLegacyBindingContext } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
// import { wxEnvModule } from './contributions/module';
import { bindWxCanvasModules } from '../canvas/contributions/wx/modules';
import { bindWxWindowContribution } from '../window/contributions/wx-contribution';
import { WxEnvContribution } from './contributions/wx-contribution';
import type { LegacyBindContainer, LegacyContainer } from '../common/legacy-container';

let isWxBound = false;

export function bindWxEnv(container: LegacyBindContainer) {
  if (!isWxBound) {
    isWxBound = true;
    container.bind(WxEnvContribution).toSelf().inSingletonScope();
    container.bind(EnvContribution).toService(WxEnvContribution);
  }
}

export function loadWxEnv(container: LegacyContainer = getLegacyBindingContext(), loadPicker: boolean = true) {
  if (!loadWxEnv.__loaded) {
    loadWxEnv.__loaded = true;
    bindWxEnv(container);
    bindWxCanvasModules(container);
    bindWxWindowContribution(container);
    loadPicker && loadMathPicker(container);
  }
}

loadWxEnv.__loaded = false;

export function initWxEnv() {
  loadWxEnv();
}
