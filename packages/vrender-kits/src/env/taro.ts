import { container, type Container } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
import { taroEnvModule } from './contributions/module';
import { taroCanvasModule } from '../canvas/contributions/taro/modules';
import { taroWindowModule } from '../window/contributions/taro-contribution';

export function loadTaroEnv(container: Container, loadPicker: boolean = true) {
  container.load(taroEnvModule);
  container.load(taroCanvasModule);
  container.load(taroWindowModule);
  loadPicker && loadMathPicker(container);
}

export function initTaroEnv() {
  loadTaroEnv(container);
}
