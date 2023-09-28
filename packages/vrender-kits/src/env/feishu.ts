import { container, type Container } from '@visactor/vrender-core';
import { feishuEnvModule } from './contributions/feishu-module';
import { feishuCanvasModule } from '../canvas/contributions/feishu/modules';
import { feishuWindowModule } from '../window/contributions/feishu-contribution';
import { loadMathPicker } from '../picker/math-module';

export function loadFeishuEnv(container: Container, loadPicker: boolean = true) {
  container.load(feishuEnvModule);
  container.load(feishuCanvasModule);
  container.load(feishuWindowModule);
  loadPicker && loadMathPicker(container);
}

export function initFeishuEnv() {
  loadFeishuEnv(container);
}
