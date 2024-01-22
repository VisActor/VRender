import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
import { feishuCanvasModule } from '../canvas/contributions/feishu/modules';
import { feishuWindowModule } from '../window/contributions/feishu-contribution';
import { loadMathPicker } from '../picker/math-module';
import { FeishuEnvContribution } from './contributions/feishu-contribution';

export const feishuEnvModule = new ContainerModule(bind => {
  // feishu
  if (!(feishuEnvModule as any).isFeishuBound) {
    (feishuEnvModule as any).isFeishuBound = true;
    bind(FeishuEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(FeishuEnvContribution);
  }
});

(feishuEnvModule as any).isFeishuBound = false;

export function loadFeishuEnv(container: Container, loadPicker: boolean = true) {
  if (!loadFeishuEnv.__loaded) {
    loadFeishuEnv.__loaded = true;
    container.load(feishuEnvModule);
    container.load(feishuCanvasModule);
    container.load(feishuWindowModule);
    loadPicker && loadMathPicker(container);
  }
}

loadFeishuEnv.__loaded = false;

export function initFeishuEnv() {
  loadFeishuEnv(container);
}
