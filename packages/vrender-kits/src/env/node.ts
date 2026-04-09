import { EnvContribution, getLegacyBindingContext } from '@visactor/vrender-core';
// import { loadMathPicker } from '../picker/math-module';
// import { nodeEnvModule } from './contributions/module';
import { bindNodeCanvasModules } from '../canvas/contributions/node/modules';
import { bindNodeWindowContribution } from '../window/contributions/node-contribution';
import { NodeEnvContribution } from './contributions/node-contribution';
import type { LegacyBindContainer, LegacyContainer } from '../common/legacy-container';

let isNodeBound = false;

export function bindNodeEnv(container: LegacyBindContainer) {
  if (!isNodeBound) {
    isNodeBound = true;
    container.bind(NodeEnvContribution).toSelf().inSingletonScope();
    container.bind(EnvContribution).toService(NodeEnvContribution);
  }
}

export function loadNodeEnv(container: LegacyContainer = getLegacyBindingContext(), loadPicker: boolean = true) {
  if (!loadNodeEnv.__loaded) {
    loadNodeEnv.__loaded = true;
    bindNodeEnv(container);
    bindNodeCanvasModules(container);
    bindNodeWindowContribution(container);
    // loadPicker && loadMathPicker(container);
  }
}
loadNodeEnv.__loaded = false;

export function initNodeEnv() {
  loadNodeEnv();
}
