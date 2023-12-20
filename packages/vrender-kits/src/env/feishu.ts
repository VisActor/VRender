import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
import { feishuCanvasModule } from '../canvas/contributions/feishu/modules';
import { feishuWindowModule } from '../window/contributions/feishu-contribution';
import { loadMathPicker } from '../picker/math-module';
import { FeishuEnvContribution } from './contributions/feishu-contribution';

let isFeishuBound = false;
export const feishuEnvModule = new ContainerModule(bind => {
  // feishu
  if (!isFeishuBound) {
    isFeishuBound = true;
    bind(FeishuEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(FeishuEnvContribution);
  }
});

let loaded = false;
export function loadFeishuEnv(container: Container, loadPicker: boolean = true) {
  if (!loaded) {
    loaded = true;
    container.load(feishuEnvModule);
    container.load(feishuCanvasModule);
    container.load(feishuWindowModule);
    loadPicker && loadMathPicker(container);
  }
}

export function initFeishuEnv() {
  loadFeishuEnv(container);
}
