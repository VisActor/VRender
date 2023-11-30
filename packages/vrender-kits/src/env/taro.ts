import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
// import { taroEnvModule } from './contributions/module';
import { taroCanvasModule } from '../canvas/contributions/taro/modules';
import { taroWindowModule } from '../window/contributions/taro-contribution';
import { TaroEnvContribution } from './contributions/taro-contribution';

let isTaroBound = false;
export const taroEnvModule = new ContainerModule(bind => {
  // taro
  if (!isTaroBound) {
    isTaroBound = true;
    bind(TaroEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(TaroEnvContribution);
  }
});

let loaded = false;
export function loadTaroEnv(container: Container, loadPicker: boolean = true) {
  if (!loaded) {
    loaded = true;
    container.load(taroEnvModule);
    container.load(taroCanvasModule);
    container.load(taroWindowModule);
    loadPicker && loadMathPicker(container);
  }
}

export function initTaroEnv() {
  loadTaroEnv(container);
}
